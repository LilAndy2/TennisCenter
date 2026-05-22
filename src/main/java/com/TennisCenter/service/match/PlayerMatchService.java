package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.TennisCenter.model.User;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerMatchService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentMatchMapper tournamentMatchMapper;

    /**
     * Returns matches where the current player is a participant.
     * Includes:
     *   - All SCHEDULED (not completed) matches where both players are assigned
     *   - COMPLETED matches that were completed today (based on completedAt timestamp)
     */
    public List<TournamentMatchResponse> getMyActiveMatches(User currentUser) {
        Long userId = currentUser.getId();
        LocalDate today = LocalDate.now();

        List<TournamentMatch> allMyMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(userId, userId);

        return allMyMatches.stream()
                .filter(match -> {
                    if (match.getStatus() != TournamentMatchStatus.COMPLETED) {
                        return true;
                    }

                    // Show completed matches only if they were completed today
                    if (match.getCompletedAt() != null) {
                        return !match.getCompletedAt().toLocalDate().isBefore(today);
                    }

                    LocalDate matchDay = null;
                    if (match.getScheduledTime() != null) {
                        matchDay = match.getScheduledTime().toLocalDate();
                    } else if (match.getMatchDate() != null) {
                        matchDay = match.getMatchDate();
                    }

                    return matchDay != null && !matchDay.isBefore(today);
                })
                .sorted(Comparator
                        .comparing((TournamentMatch m) -> m.getStatus() == TournamentMatchStatus.COMPLETED ? 1 : 0)
                        .thenComparing(m -> m.getScheduledTime() != null
                                ? m.getScheduledTime()
                                : m.getMatchDate() != null
                                ? m.getMatchDate().atStartOfDay()
                                : java.time.LocalDateTime.MAX)
                )
                .map(match -> tournamentMatchMapper.toResponse(match, currentUser))
                .toList();
    }
}