package com.TennisCenter.service.ranking;

import com.TennisCenter.model.RankingPoint;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.RankingPointRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class RankingService {

    private static final int WIN_POINTS = 100;
    private static final int LOSS_POINTS = 25;

    private final RankingPointRepository rankingPointRepository;
    private final UserRepository userRepository;

    @Transactional
    public void awardMatchPoints(TournamentMatch match, User winner, User loser) {
        LocalDate today = LocalDate.now();
        LocalDate expiryDate = today.plusYears(1);

        rankingPointRepository.deleteByMatchId(match.getId());

        rankingPointRepository.save(RankingPoint.builder()
                .user(winner)
                .match(match)
                .points(WIN_POINTS)
                .awardedDate(today)
                .expiryDate(expiryDate)
                .win(true)
                .build());

        rankingPointRepository.save(RankingPoint.builder()
                .user(loser)
                .match(match)
                .points(LOSS_POINTS)
                .awardedDate(today)
                .expiryDate(expiryDate)
                .win(false)
                .build());

        syncUserStats(winner);
        syncUserStats(loser);
    }

    @Transactional
    public void syncUserStats(User user) {
        LocalDate today = LocalDate.now();

        int activePoints = rankingPointRepository.sumActivePointsByUserId(user.getId(), today);
        int wins = rankingPointRepository.countWinsByUserId(user.getId());
        int losses = rankingPointRepository.countLossesByUserId(user.getId());

        user.setRankingPoints(activePoints);
        user.setWins(wins);
        user.setLosses(losses);
        userRepository.save(user);
    }

    public int getActivePoints(Long userId) {
        return rankingPointRepository.sumActivePointsByUserId(userId, LocalDate.now());
    }

    public int getWins(Long userId) {
        return rankingPointRepository.countWinsByUserId(userId);
    }

    public int getLosses(Long userId) {
        return rankingPointRepository.countLossesByUserId(userId);
    }
}