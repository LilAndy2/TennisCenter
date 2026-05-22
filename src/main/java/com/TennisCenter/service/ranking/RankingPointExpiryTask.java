package com.TennisCenter.service.ranking;

import com.TennisCenter.model.RankingPoint;
import com.TennisCenter.repository.RankingPointRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class RankingPointExpiryTask {

    private final RankingPointRepository rankingPointRepository;
    private final UserRepository userRepository;
    private final RankingService rankingService;

    /**
     * Runs every day at 00:05.
     * Finds all ranking points that have expired and syncs the affected users' stats.
     * The expired points are not deleted — they remain for historical record —
     * but they are excluded from the active points sum via the expiryDate query.
     */
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void syncExpiredPoints() {
        LocalDate today = LocalDate.now();

        List<RankingPoint> expiredToday = rankingPointRepository
                .findByExpiryDateLessThanEqual(today);

        if (expiredToday.isEmpty()) return;

        Set<Long> affectedUserIds = expiredToday.stream()
                .map(rp -> rp.getUser().getId())
                .collect(Collectors.toSet());

        log.info("Syncing ranking stats for {} users with expiring points", affectedUserIds.size());

        for (Long userId : affectedUserIds) {
            userRepository.findById(userId).ifPresent(rankingService::syncUserStats);
        }
    }
}