package com.TennisCenter.service.match;

import com.TennisCenter.dto.h2h.H2HResponse;
import com.TennisCenter.dto.h2h.H2HResponse.*;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class H2HService {

    private final UserRepository userRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;
    private final MatchPredictionService matchPredictionService;

    public H2HResponse getH2H(Long playerAId, Long playerBId) {
        User playerA = userRepository.findById(playerAId)
                .orElseThrow(() -> new ResourceNotFoundException("Player A not found"));
        User playerB = userRepository.findById(playerBId)
                .orElseThrow(() -> new ResourceNotFoundException("Player B not found"));

        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(playerAId, playerAId)
                .stream()
                .filter(m -> {
                    Long p1 = m.getPlayerOne() != null ? m.getPlayerOne().getId() : null;
                    Long p2 = m.getPlayerTwo() != null ? m.getPlayerTwo().getId() : null;
                    return (Objects.equals(p1, playerBId) || Objects.equals(p2, playerBId));
                })
                .sorted(Comparator.comparing(m -> {
                    if (m.getScheduledTime() != null) return m.getScheduledTime().toLocalDate();
                    if (m.getMatchDate() != null) return m.getMatchDate();
                    return m.getTournament().getStartDate();
                }))
                .toList();

        List<H2HMatch> pastMatches = new ArrayList<>();
        List<H2HMatch> upcomingMatches = new ArrayList<>();
        int playerAWins = 0;
        int playerBWins = 0;

        for (TournamentMatch m : allMatches) {
            String date = m.getScheduledTime() != null
                    ? m.getScheduledTime().toLocalDate().toString()
                    : (m.getMatchDate() != null ? m.getMatchDate().toString()
                    : m.getTournament().getStartDate().toString());

            String tournamentName = m.getTournament().getName();
            String surface = m.getTournament().getSurface() != null
                    ? m.getTournament().getSurface().getDisplayName() : null;

            if (m.getStatus() == TournamentMatchStatus.COMPLETED && m.getWinner() != null) {
                List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(m.getId());
                StringBuilder scoreStr = new StringBuilder();
                for (MatchSet s : sets) {
                    if (scoreStr.length() > 0) scoreStr.append("  ");

                    // Show score from winner's perspective
                    boolean winnerIsP1 = m.getWinner().getId().equals(
                            m.getPlayerOne() != null ? m.getPlayerOne().getId() : -1);
                    int wGames = winnerIsP1 ? s.getPlayerOneGames() : s.getPlayerTwoGames();
                    int lGames = winnerIsP1 ? s.getPlayerTwoGames() : s.getPlayerOneGames();
                    scoreStr.append(wGames).append("-").append(lGames);

                    if (s.getPlayerOneTiebreakPoints() != null && s.getPlayerTwoTiebreakPoints() != null) {
                        int loserTb = winnerIsP1
                                ? s.getPlayerTwoTiebreakPoints()
                                : s.getPlayerOneTiebreakPoints();
                        scoreStr.append("(").append(loserTb).append(")");
                    }
                }

                pastMatches.add(H2HMatch.builder()
                        .matchId(m.getId())
                        .tournamentName(tournamentName)
                        .surface(surface)
                        .date(date)
                        .score(scoreStr.toString())
                        .winnerId(m.getWinner().getId())
                        .status("COMPLETED")
                        .build());

                if (m.getWinner().getId().equals(playerAId)) playerAWins++;
                else playerBWins++;

            } else if (m.getStatus() == TournamentMatchStatus.SCHEDULED) {
                upcomingMatches.add(H2HMatch.builder()
                        .matchId(m.getId())
                        .tournamentName(tournamentName)
                        .surface(surface)
                        .date(date)
                        .score(null)
                        .winnerId(null)
                        .status("SCHEDULED")
                        .build());
            }
        }

        Collections.reverse(pastMatches);

        PlayerSummary summaryA = buildPlayerSummary(playerA);
        PlayerSummary summaryB = buildPlayerSummary(playerB);

        Prediction prediction = matchPredictionService.predict(playerA, playerB);

        return H2HResponse.builder()
                .playerA(summaryA)
                .playerB(summaryB)
                .playerAWins(playerAWins)
                .playerBWins(playerBWins)
                .totalMatches(playerAWins + playerBWins)
                .pastMatches(pastMatches)
                .upcomingMatches(upcomingMatches)
                .prediction(prediction)
                .build();
    }

    public List<PlayerSummary> searchPlayers(String query) {
        if (query == null || query.isBlank()) return Collections.emptyList();

        String q = query.trim().toLowerCase();

        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(com.TennisCenter.model.enums.Role.PLAYER))
                .filter(u -> u.getFullName().toLowerCase().contains(q)
                        || u.getDisplayUsername().toLowerCase().contains(q))
                .limit(10)
                .map(this::buildPlayerSummary)
                .collect(Collectors.toList());
    }

    private PlayerSummary buildPlayerSummary(User user) {
        int wins = user.getWins() == null ? 0 : user.getWins();
        int losses = user.getLosses() == null ? 0 : user.getLosses();
        int total = wins + losses;
        double winRate = total > 0 ? Math.round(((double) wins / total) * 1000.0) / 10.0 : 0;

        return PlayerSummary.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .level(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : "-")
                .eloRating(user.getEloRating() != null ? user.getEloRating() : 1200)
                .wins(wins)
                .losses(losses)
                .winRate(winRate)
                .rankingPoints(user.getRankingPoints() != null ? user.getRankingPoints() : 0)
                .build();
    }
}