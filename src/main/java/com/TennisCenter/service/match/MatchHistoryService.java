package com.TennisCenter.service.match;

import com.TennisCenter.dto.profile.MatchHistoryResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchPointRepository;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchHistoryService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;
    private final MatchPointRepository matchPointRepository;
    private final UserRepository userRepository;

    public List<MatchHistoryResponse> getMatchHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(userId, userId);

        List<TournamentMatch> filtered = allMatches.stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .toList();

        java.util.function.Function<TournamentMatch, java.time.LocalDateTime> matchDate = m -> {
            if (m.getScheduledTime() != null) return m.getScheduledTime();
            if (m.getMatchDate() != null) return m.getMatchDate().atStartOfDay();
            return m.getTournament().getStartDate().atStartOfDay();
        };

        java.util.Map<Long, java.time.LocalDateTime> tournamentMaxDate = new java.util.HashMap<>();
        for (TournamentMatch m : filtered) {
            Long tid = m.getTournament().getId();
            java.time.LocalDateTime d = matchDate.apply(m);
            tournamentMaxDate.merge(tid, d, (a, b) -> a.isAfter(b) ? a : b);
        }

        List<TournamentMatch> completedMatches = filtered.stream()
                .sorted(Comparator
                        .comparing((TournamentMatch m) -> tournamentMaxDate.get(m.getTournament().getId()))
                        .reversed()
                        .thenComparing(Comparator.comparingInt(
                                        (TournamentMatch m) -> m.getRoundNumber() != null ? m.getRoundNumber() : 0)
                                .reversed())
                        .thenComparing(Comparator.comparing(matchDate).reversed()))
                .toList();

        List<MatchHistoryResponse> result = new ArrayList<>();

        for (TournamentMatch match : completedMatches) {
            User winner = match.getWinner();
            User loser = getLoser(match);

            if (winner == null || loser == null) continue;

            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());
            List<MatchHistoryResponse.SetScoreResponse> setScores = buildSetScores(sets, match);

            String round = resolveRoundLabel(match);

            boolean profilePlayerWon = winner.getId().equals(userId);

            result.add(MatchHistoryResponse.builder()
                    .matchId(match.getId())
                    .matchDate(match.getScheduledTime() != null
                            ? match.getScheduledTime().toLocalDate().toString()
                            : match.getMatchDate() != null
                            ? match.getMatchDate().toString()
                            : match.getTournament().getStartDate().toString())
                    .round(round)
                    .winnerName(winner.getFullName())
                    .winnerId(winner.getId())
                    .loserName(loser.getFullName())
                    .loserId(loser.getId())
                    .sets(setScores)
                    .profilePlayerWon(profilePlayerWon)
                    .tournamentId(match.getTournament().getId())
                    .tournamentName(match.getTournament().getName())
                    .surface(match.getTournament().getSurface() != null
                            ? match.getTournament().getSurface().getDisplayName() : null)
                    .tournamentStartYear(match.getTournament().getStartDate().getYear())
                    .hasStats(matchPointRepository.existsByMatchId(match.getId()))
                    .build());
        }

        return result;
    }

    public User getLoser(TournamentMatch match) {
        if (match.getWinner() == null) return null;
        if (match.getPlayerOne() != null && match.getPlayerOne().getId().equals(match.getWinner().getId())) {
            return match.getPlayerTwo();
        }
        return match.getPlayerOne();
    }

    public List<MatchHistoryResponse.SetScoreResponse> buildSetScores(List<MatchSet> sets, TournamentMatch match) {
        if (sets.isEmpty()) return List.of();

        User winner = match.getWinner();
        boolean playerOneIsWinner = match.getPlayerOne() != null
                && winner != null
                && match.getPlayerOne().getId().equals(winner.getId());

        List<MatchHistoryResponse.SetScoreResponse> result = new ArrayList<>();

        for (MatchSet set : sets) {
            int winnerGames;
            int loserGames;
            Integer loserTiebreak = null;

            if (playerOneIsWinner) {
                winnerGames = set.getPlayerOneGames();
                loserGames = set.getPlayerTwoGames();
                if (winnerGames == 7 && loserGames == 6 && set.getPlayerTwoTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerTwoTiebreakPoints();
                }
                if (loserGames == 7 && winnerGames == 6 && set.getPlayerOneTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerOneTiebreakPoints();
                }
            } else {
                winnerGames = set.getPlayerTwoGames();
                loserGames = set.getPlayerOneGames();
                if (winnerGames == 7 && loserGames == 6 && set.getPlayerOneTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerOneTiebreakPoints();
                }
                if (loserGames == 7 && winnerGames == 6 && set.getPlayerTwoTiebreakPoints() != null) {
                    loserTiebreak = set.getPlayerTwoTiebreakPoints();
                }
            }

            result.add(MatchHistoryResponse.SetScoreResponse.builder()
                    .winnerGames(winnerGames)
                    .loserGames(loserGames)
                    .loserTiebreakPoints(loserTiebreak)
                    .build());
        }

        return result;
    }

    public String resolveRoundLabel(TournamentMatch match) {
        if (match.getPhase() == TournamentMatchPhase.GROUP_STAGE) {
            return "Round Robin";
        }

        Integer roundNumber = match.getRoundNumber();
        if (roundNumber == null) return "Knockout";

        List<TournamentMatch> knockoutMatches = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(match.getTournament().getId())
                .stream()
                .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT)
                .toList();

        int totalRounds = knockoutMatches.stream()
                .mapToInt(m -> m.getRoundNumber() != null ? m.getRoundNumber() : 0)
                .max()
                .orElse(1);

        int roundsFromFinal = totalRounds - roundNumber;

        return switch (roundsFromFinal) {
            case 0 -> "Final";
            case 1 -> "Semifinal";
            case 2 -> "Quarterfinal";
            case 3 -> "Round of 16";
            case 4 -> "Round of 32";
            default -> "Round " + roundNumber;
        };
    }
}