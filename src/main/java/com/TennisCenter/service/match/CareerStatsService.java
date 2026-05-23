package com.TennisCenter.service.match;

import com.TennisCenter.dto.profile.CareerStatsResponse;
import com.TennisCenter.dto.profile.CareerStatsResponse.Advice;
import com.TennisCenter.dto.profile.CareerStatsResponse.MatchStatSnapshot;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchPoint;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.MatchPointRepository;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CareerStatsService {

    private final UserRepository userRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchPointRepository matchPointRepository;
    private final MatchSetRepository matchSetRepository;

    public CareerStatsResponse getCareerStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Get all completed matches for this player
        List<TournamentMatch> allMatches = tournamentMatchRepository
                .findByPlayerOneIdOrPlayerTwoId(userId, userId)
                .stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .filter(m -> m.getPlayerOne() != null && m.getPlayerTwo() != null)
                .sorted(Comparator.comparing(m -> {
                    if (m.getScheduledTime() != null) return m.getScheduledTime().toLocalDate();
                    if (m.getMatchDate() != null) return m.getMatchDate();
                    return m.getTournament().getStartDate();
                }))
                .toList();

        if (allMatches.isEmpty()) {
            return buildEmptyResponse();
        }

        // Get match IDs that have point data
        List<Long> matchIdsWithPoints = allMatches.stream()
                .map(TournamentMatch::getId)
                .filter(matchPointRepository::existsByMatchId)
                .toList();

        // Load all points in one query
        List<MatchPoint> allPoints = matchIdsWithPoints.isEmpty()
                ? Collections.emptyList()
                : matchPointRepository.findByMatchIdInOrderByMatchIdAscPointNumberAsc(matchIdsWithPoints);

        // Group points by match
        Map<Long, List<MatchPoint>> pointsByMatch = allPoints.stream()
                .collect(Collectors.groupingBy(mp -> mp.getMatch().getId(), LinkedHashMap::new, Collectors.toList()));

        // ── Compute aggregate stats ──

        int totalMatches = allMatches.size();
        int wins = 0, losses = 0;
        int currentStreak = 0;
        int longestWinStreak = 0;
        int tempWinStreak = 0;

        // Surface tracking
        int clayWins = 0, clayTotal = 0;
        int hardWins = 0, hardTotal = 0;
        int grassWins = 0, grassTotal = 0;

        // Clutch tracking
        int wonAfterLosingFirstSet = 0, lostFirstSetTotal = 0;
        int decidingSetWins = 0, decidingSetTotal = 0;
        int tbWins = 0, tbTotal = 0;

        // Aggregate point stats
        long totalServePoints = 0, totalFirstServes = 0, totalFirstServeWon = 0;
        long totalSecondServePoints = 0, totalSecondServeWon = 0;
        long totalAces = 0, totalDoubleFaults = 0;
        long totalServiceGamesPlayed = 0, totalServiceGamesHeld = 0;
        long totalReturnPointsWon = 0, totalReturnPoints = 0;
        long totalBreakPointsWon = 0, totalBreakPointsTotal = 0;
        long totalWinners = 0, totalFhWinners = 0, totalBhWinners = 0, totalVolleyWinners = 0;
        long totalUE = 0, totalFhUE = 0, totalBhUE = 0;
        long totalForcedErrors = 0;
        long totalNetWon = 0, totalNetTotal = 0;
        long totalPointsPlayed = 0;

        int matchesWithPoints = 0;
        List<MatchStatSnapshot> snapshots = new ArrayList<>();

        for (TournamentMatch match : allMatches) {
            boolean playerWon = match.getWinner().getId().equals(userId);

            if (playerWon) {
                wins++;
                tempWinStreak++;
                longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
            } else {
                losses++;
                tempWinStreak = 0;
            }

            // Surface
            String surface = match.getTournament().getSurface() != null
                    ? match.getTournament().getSurface().name() : null;
            if ("CLAY".equals(surface)) { clayTotal++; if (playerWon) clayWins++; }
            else if ("HARD".equals(surface)) { hardTotal++; if (playerWon) hardWins++; }
            else if ("GRASS".equals(surface)) { grassTotal++; if (playerWon) grassWins++; }

            // Set-based stats
            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());
            if (!sets.isEmpty()) {
                boolean isP1 = match.getPlayerOne().getId().equals(userId);
                MatchSet firstSet = sets.get(0);
                int playerFirstSetGames = isP1 ? firstSet.getPlayerOneGames() : firstSet.getPlayerTwoGames();
                int oppFirstSetGames = isP1 ? firstSet.getPlayerTwoGames() : firstSet.getPlayerOneGames();

                if (playerFirstSetGames < oppFirstSetGames) {
                    lostFirstSetTotal++;
                    if (playerWon) wonAfterLosingFirstSet++;
                }

                if (sets.size() == 3) {
                    decidingSetTotal++;
                    if (playerWon) decidingSetWins++;
                }

                // Tiebreaks
                for (MatchSet s : sets) {
                    if (s.getPlayerOneTiebreakPoints() != null && s.getPlayerTwoTiebreakPoints() != null) {
                        tbTotal++;
                        int playerTb = isP1 ? s.getPlayerOneTiebreakPoints() : s.getPlayerTwoTiebreakPoints();
                        int oppTb = isP1 ? s.getPlayerTwoTiebreakPoints() : s.getPlayerOneTiebreakPoints();
                        if (playerTb > oppTb) tbWins++;
                    }
                }
            }

            // Point-by-point stats
            List<MatchPoint> points = pointsByMatch.get(match.getId());
            if (points != null && !points.isEmpty()) {
                matchesWithPoints++;
                PerMatchStats pms = computePerMatchStats(points, userId, match);
                totalServePoints += pms.servePoints;
                totalFirstServes += pms.firstServesIn;
                totalFirstServeWon += pms.firstServeWon;
                totalSecondServePoints += pms.secondServePoints;
                totalSecondServeWon += pms.secondServeWon;
                totalAces += pms.aces;
                totalDoubleFaults += pms.doubleFaults;
                totalServiceGamesPlayed += pms.serviceGamesPlayed;
                totalServiceGamesHeld += pms.serviceGamesHeld;
                totalReturnPointsWon += pms.returnPointsWon;
                totalReturnPoints += pms.returnPoints;
                totalBreakPointsWon += pms.breakPointsWon;
                totalBreakPointsTotal += pms.breakPointsTotal;
                totalWinners += pms.winners;
                totalFhWinners += pms.fhWinners;
                totalBhWinners += pms.bhWinners;
                totalVolleyWinners += pms.volleyWinners;
                totalUE += pms.unforcedErrors;
                totalFhUE += pms.fhUE;
                totalBhUE += pms.bhUE;
                totalForcedErrors += pms.forcedErrorsDrawn;
                totalNetWon += pms.netWon;
                totalNetTotal += pms.netTotal;
                totalPointsPlayed += pms.totalPoints;

                // Build snapshot
                String matchDate = match.getScheduledTime() != null
                        ? match.getScheduledTime().toLocalDate().toString()
                        : (match.getMatchDate() != null ? match.getMatchDate().toString()
                        : match.getTournament().getStartDate().toString());

                boolean isP1 = match.getPlayerOne().getId().equals(userId);
                String opponentName = isP1
                        ? match.getPlayerTwo().getFullName()
                        : match.getPlayerOne().getFullName();

                String surfaceDisplay = match.getTournament().getSurface() != null
                        ? match.getTournament().getSurface().getDisplayName() : null;

                snapshots.add(MatchStatSnapshot.builder()
                        .matchId(match.getId())
                        .date(matchDate)
                        .won(playerWon)
                        .firstServePct(pms.servePoints > 0
                                ? round((double) pms.firstServesIn / pms.servePoints * 100) : 0)
                        .winnersToUeRatio(pms.unforcedErrors > 0
                                ? round((double) pms.winners / pms.unforcedErrors) : pms.winners)
                        .winners((int) pms.winners)
                        .unforcedErrors((int) pms.unforcedErrors)
                        .aces((int) pms.aces)
                        .doubleFaults((int) pms.doubleFaults)
                        .surface(surfaceDisplay)
                        .opponentName(opponentName)
                        .build());
            }
        }

        // Compute current streak (from most recent match backwards)
        currentStreak = 0;
        for (int i = allMatches.size() - 1; i >= 0; i--) {
            boolean won = allMatches.get(i).getWinner().getId().equals(userId);
            if (i == allMatches.size() - 1) {
                currentStreak = won ? 1 : -1;
            } else {
                if (won && currentStreak > 0) currentStreak++;
                else if (!won && currentStreak < 0) currentStreak--;
                else break;
            }
        }

        double winRate = totalMatches > 0 ? round((double) wins / totalMatches * 100) : 0;

        // Compute averages (use matchesWithPoints for per-match averages)
        int mwp = Math.max(matchesWithPoints, 1);

        Collections.reverse(snapshots);

        CareerStatsResponse.CareerStatsResponseBuilder builder = CareerStatsResponse.builder()
                .totalMatches(totalMatches)
                .wins(wins)
                .losses(losses)
                .winRate(winRate)
                .titlesCount(0) // will be set from profile if needed
                .finalsCount(0)
                .currentStreak(currentStreak)
                .longestWinStreak(longestWinStreak)
                .avgPointsPerMatch(totalPointsPlayed > 0 ? round((double) totalPointsPlayed / mwp) : 0)
                // Serve
                .firstServePercentage(totalServePoints > 0 ? round((double) totalFirstServes / totalServePoints * 100) : 0)
                .firstServePointsWonPct(totalFirstServes > 0 ? round((double) totalFirstServeWon / totalFirstServes * 100) : 0)
                .secondServePointsWonPct(totalSecondServePoints > 0 ? round((double) totalSecondServeWon / totalSecondServePoints * 100) : 0)
                .acesPerMatch(round((double) totalAces / mwp))
                .doubleFaultsPerMatch(round((double) totalDoubleFaults / mwp))
                .aceToDoubleFaultRatio(totalDoubleFaults > 0 ? round((double) totalAces / totalDoubleFaults) : totalAces)
                .serviceGamesHeldPct(totalServiceGamesPlayed > 0 ? round((double) totalServiceGamesHeld / totalServiceGamesPlayed * 100) : 0)
                // Return
                .returnPointsWonPct(totalReturnPoints > 0 ? round((double) totalReturnPointsWon / totalReturnPoints * 100) : 0)
                .breakPointsConvertedPct(totalBreakPointsTotal > 0 ? round((double) totalBreakPointsWon / totalBreakPointsTotal * 100) : 0)
                // Shotmaking
                .winnersPerMatch(round((double) totalWinners / mwp))
                .fhWinnersPerMatch(round((double) totalFhWinners / mwp))
                .bhWinnersPerMatch(round((double) totalBhWinners / mwp))
                .volleyWinnersPerMatch(round((double) totalVolleyWinners / mwp))
                .unforcedErrorsPerMatch(round((double) totalUE / mwp))
                .fhUnforcedErrorsPerMatch(round((double) totalFhUE / mwp))
                .bhUnforcedErrorsPerMatch(round((double) totalBhUE / mwp))
                .winnersToUeRatio(totalUE > 0 ? round((double) totalWinners / totalUE) : totalWinners)
                .forcedErrorsDrawnPerMatch(round((double) totalForcedErrors / mwp))
                .netApproachSuccessPct(totalNetTotal > 0 ? round((double) totalNetWon / totalNetTotal * 100) : 0)
                // Clutch
                .winRateAfterLosingFirstSet(lostFirstSetTotal > 0 ? round((double) wonAfterLosingFirstSet / lostFirstSetTotal * 100) : 0)
                .decidingSetWinRate(decidingSetTotal > 0 ? round((double) decidingSetWins / decidingSetTotal * 100) : 0)
                .tiebreakWinRate(tbTotal > 0 ? round((double) tbWins / tbTotal * 100) : 0)
                // Surface
                .clayWinRate(clayTotal > 0 ? round((double) clayWins / clayTotal * 100) : 0)
                .hardWinRate(hardTotal > 0 ? round((double) hardWins / hardTotal * 100) : 0)
                .grassWinRate(grassTotal > 0 ? round((double) grassWins / grassTotal * 100) : 0)
                .clayMatches(clayTotal)
                .hardMatches(hardTotal)
                .grassMatches(grassTotal)
                // Trends (most recent first)
                .matchTrends(snapshots);

        // ── Generate advice ──
        List<Advice> adviceList = generateAdvice(builder.build());
        builder.advice(adviceList);

        return builder.build();
    }

    // ── Per-match stats computation ──

    private PerMatchStats computePerMatchStats(List<MatchPoint> points, Long playerId, TournamentMatch match) {
        PerMatchStats s = new PerMatchStats();
        boolean isP1 = match.getPlayerOne().getId().equals(playerId);
        Long p1Id = match.getPlayerOne().getId();

        // Replay with engine to get break point / service game stats
        TennisScoreEngine engine = new TennisScoreEngine(
                match.getPlayerOne().getId(),
                match.getPlayerTwo().getId(),
                points.get(0).getServer().getId()
        );

        for (MatchPoint mp : points) {
            boolean playerIsServer = mp.getServer().getId().equals(playerId);
            boolean playerWonPoint = mp.getPointWinner().getId().equals(playerId);
            PointOutcome outcome = mp.getPointOutcome();
            ShotType shot = mp.getShotType();
            ServeType serve = mp.getServeType();

            s.totalPoints++;

            // Serve stats (when this player is serving)
            if (playerIsServer) {
                s.servePoints++;
                if (serve == ServeType.FIRST_SERVE) {
                    s.firstServesIn++;
                    if (playerWonPoint) s.firstServeWon++;
                } else {
                    s.secondServePoints++;
                    if (playerWonPoint) s.secondServeWon++;
                }
                if (outcome == PointOutcome.ACE) s.aces++;
                if (outcome == PointOutcome.DOUBLE_FAULT) s.doubleFaults++;
            } else {
                // Return stats
                s.returnPoints++;
                if (playerWonPoint) s.returnPointsWon++;
            }

            // Winners hit BY this player
            if (outcome == PointOutcome.WINNER && playerWonPoint && shot != null) {
                s.winners++;
                switch (shot) {
                    case FOREHAND -> s.fhWinners++;
                    case BACKHAND -> s.bhWinners++;
                    case VOLLEY -> s.volleyWinners++;
                }
            }

            // Unforced errors committed BY this player (player LOST the point)
            if (outcome == PointOutcome.UNFORCED_ERROR && !playerWonPoint && shot != null) {
                s.unforcedErrors++;
                switch (shot) {
                    case FOREHAND -> s.fhUE++;
                    case BACKHAND -> s.bhUE++;
                    case VOLLEY -> {} // counted in net stats
                }
            }

            // Forced errors: the loser of the point was forced into an error
            // This means the winner "drew" the forced error
            if (outcome == PointOutcome.FORCED_ERROR && playerWonPoint) {
                s.forcedErrorsDrawn++;
            }

            // Net points (volley)
            if (shot == ShotType.VOLLEY && playerWonPoint && outcome == PointOutcome.WINNER) {
                s.netWon++;
                s.netTotal++;
            }
            if (shot == ShotType.VOLLEY && !playerWonPoint && outcome == PointOutcome.UNFORCED_ERROR) {
                s.netTotal++; // approached but lost
            }

            // Process engine for break point tracking
            try {
                engine.processPoint(mp.getPointWinner().getId());
            } catch (IllegalStateException ex) {
                // Match already completed, ignore extra stored points
                break;
            }
        }

        // Extract break point and service game stats from engine
        if (isP1) {
            s.serviceGamesPlayed = engine.getP1ServiceGamesPlayed();
            s.serviceGamesHeld = engine.getP1ServiceGamesHeld();
            s.breakPointsWon = engine.getP1BreakPointsConverted();
            s.breakPointsTotal = engine.getP1BreakPointsFaced();
        } else {
            s.serviceGamesPlayed = engine.getP2ServiceGamesPlayed();
            s.serviceGamesHeld = engine.getP2ServiceGamesHeld();
            s.breakPointsWon = engine.getP2BreakPointsConverted();
            s.breakPointsTotal = engine.getP2BreakPointsFaced();
        }

        return s;
    }

    // ── Advice engine ──

    private List<Advice> generateAdvice(CareerStatsResponse stats) {
        List<Advice> advice = new ArrayList<>();

        if (stats.getTotalMatches() < 3) {
            advice.add(Advice.builder()
                    .category("INFO")
                    .severity("INFO")
                    .title("Play more matches")
                    .message("Play at least 3 matches with tracked stats to unlock personalized insights and performance advice.")
                    .build());
            return advice;
        }

        // ── Strengths ──

        if (stats.getFirstServePercentage() >= 65) {
            advice.add(Advice.builder()
                    .category("SERVE").severity("STRENGTH").title("Strong first serve consistency")
                    .message("Your first serve percentage of " + stats.getFirstServePercentage()
                            + "% is excellent. You're keeping the pressure on your opponents by getting a high number of first serves in play.")
                    .build());
        }

        if (stats.getWinnersToUeRatio() >= 1.3) {
            advice.add(Advice.builder()
                    .category("AGGRESSION").severity("STRENGTH").title("Clean aggression")
                    .message("Your winners-to-unforced-errors ratio of " + stats.getWinnersToUeRatio()
                            + " shows you're playing aggressive but controlled tennis. You're creating more than you're giving away.")
                    .build());
        }

        if (stats.getServiceGamesHeldPct() >= 80) {
            advice.add(Advice.builder()
                    .category("SERVE").severity("STRENGTH").title("Reliable service hold")
                    .message("You're holding serve " + stats.getServiceGamesHeldPct()
                            + "% of the time, which is a strong foundation. Your opponents rarely break you.")
                    .build());
        }

        if (stats.getDecidingSetWinRate() >= 65 && stats.getTotalMatches() >= 5) {
            advice.add(Advice.builder()
                    .category("MENTAL").severity("STRENGTH").title("Clutch in deciding sets")
                    .message("You win " + stats.getDecidingSetWinRate()
                            + "% of deciding sets. You perform well under pressure when the match is on the line.")
                    .build());
        }

        if (stats.getBreakPointsConvertedPct() >= 45) {
            advice.add(Advice.builder()
                    .category("RETURN").severity("STRENGTH").title("Break point conversion")
                    .message("Converting " + stats.getBreakPointsConvertedPct()
                            + "% of your break points shows great intensity on crucial return games.")
                    .build());
        }

        // ── Warnings / Improvement areas ──

        if (stats.getFirstServePercentage() < 55 && stats.getFirstServePercentage() > 0) {
            advice.add(Advice.builder()
                    .category("SERVE").severity("WARNING").title("First serve needs work")
                    .message("Your first serve percentage is " + stats.getFirstServePercentage()
                            + "%, which puts too much pressure on your second serve. Focus on consistency over power — a reliable first serve reduces double fault risk and keeps you in control of service games.")
                    .build());
        }

        if (stats.getDoubleFaultsPerMatch() >= 4) {
            advice.add(Advice.builder()
                    .category("SERVE").severity("WARNING").title("Too many double faults")
                    .message("Averaging " + stats.getDoubleFaultsPerMatch()
                            + " double faults per match is giving away free points. Consider a more conservative second serve placement or practicing your toss consistency under pressure.")
                    .build());
        }

        if (stats.getWinnersToUeRatio() < 0.8 && stats.getWinnersToUeRatio() > 0) {
            advice.add(Advice.builder()
                    .category("ERRORS").severity("WARNING").title("Unforced errors are too high")
                    .message("Your winners-to-UE ratio of " + stats.getWinnersToUeRatio()
                            + " means you're giving away more free points than you're creating. Focus on shot selection — don't go for too much on neutral balls, and save aggressive plays for short balls.")
                    .build());
        }

        if (stats.getWinnersPerMatch() < 8 && stats.getTotalMatches() >= 3) {
            advice.add(Advice.builder()
                    .category("AGGRESSION").severity("WARNING").title("Look for more winners")
                    .message("Averaging only " + stats.getWinnersPerMatch()
                            + " winners per match suggests a passive style. Look for opportunities to be more decisive — step into short balls, take time away from your opponent, and practice finishing points at the net.")
                    .build());
        }

        if (stats.getFhUnforcedErrorsPerMatch() > stats.getBhUnforcedErrorsPerMatch() * 1.8
                && stats.getFhUnforcedErrorsPerMatch() >= 3) {
            advice.add(Advice.builder()
                    .category("ERRORS").severity("WARNING").title("Forehand inconsistency")
                    .message("Your forehand produces significantly more unforced errors ("
                            + stats.getFhUnforcedErrorsPerMatch() + "/match) than your backhand ("
                            + stats.getBhUnforcedErrorsPerMatch() + "/match). Opponents may target this side — work on forehand consistency, especially under pressure.")
                    .build());
        } else if (stats.getBhUnforcedErrorsPerMatch() > stats.getFhUnforcedErrorsPerMatch() * 1.8
                && stats.getBhUnforcedErrorsPerMatch() >= 3) {
            advice.add(Advice.builder()
                    .category("ERRORS").severity("WARNING").title("Backhand inconsistency")
                    .message("Your backhand produces significantly more unforced errors ("
                            + stats.getBhUnforcedErrorsPerMatch() + "/match) than your forehand ("
                            + stats.getFhUnforcedErrorsPerMatch() + "/match). Consider shoring up your backhand technique to remove this vulnerability.")
                    .build());
        }

        if (stats.getNetApproachSuccessPct() < 40 && stats.getNetApproachSuccessPct() > 0) {
            advice.add(Advice.builder()
                    .category("NET_GAME").severity("WARNING").title("Net approaches not converting")
                    .message("Only " + stats.getNetApproachSuccessPct()
                            + "% of your net approaches succeed. Work on approach shot depth and volley technique before coming forward — a weak approach shot invites passing shots.")
                    .build());
        }

        if (stats.getBreakPointsConvertedPct() < 30 && stats.getBreakPointsConvertedPct() > 0) {
            advice.add(Advice.builder()
                    .category("RETURN").severity("WARNING").title("Break point conversion is low")
                    .message("You're converting only " + stats.getBreakPointsConvertedPct()
                            + "% of break points. You create opportunities but don't capitalize. Focus on raising your intensity on big return points — move inside the baseline and take the ball early.")
                    .build());
        }

        if (stats.getServiceGamesHeldPct() < 65 && stats.getServiceGamesHeldPct() > 0) {
            advice.add(Advice.builder()
                    .category("SERVE").severity("WARNING").title("Getting broken too often")
                    .message("Holding serve only " + stats.getServiceGamesHeldPct()
                            + "% of the time puts you under pressure every game. Focus on winning free points with your serve (aces, service winners) and making your first serve count.")
                    .build());
        }

        if (stats.getWinRateAfterLosingFirstSet() < 20 && stats.getTotalMatches() >= 5) {
            advice.add(Advice.builder()
                    .category("MENTAL").severity("WARNING").title("Comebacks are rare")
                    .message("When you lose the first set, you come back only " + stats.getWinRateAfterLosingFirstSet()
                            + "% of the time. Building mental resilience between sets is key — develop a reset routine and focus on winning the first few games of the second set.")
                    .build());
        }

        if (stats.getTiebreakWinRate() < 35 && stats.getTiebreakWinRate() > 0) {
            advice.add(Advice.builder()
                    .category("MENTAL").severity("WARNING").title("Tiebreaks are a weakness")
                    .message("Your tiebreak win rate is " + stats.getTiebreakWinRate()
                            + "%. Tiebreaks reward aggression and nerve — practice serving under pressure and take an aggressive return position to put your opponent on the back foot.")
                    .build());
        }

        return advice;
    }

    private CareerStatsResponse buildEmptyResponse() {
        return CareerStatsResponse.builder()
                .totalMatches(0).wins(0).losses(0).winRate(0)
                .matchTrends(Collections.emptyList())
                .advice(List.of(Advice.builder()
                        .category("INFO").severity("INFO").title("No matches yet")
                        .message("Play your first match to start building your stats profile.")
                        .build()))
                .build();
    }

    private static double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    // ── Internal per-match accumulator ──
    private static class PerMatchStats {
        long totalPoints = 0;
        long servePoints = 0, firstServesIn = 0, firstServeWon = 0;
        long secondServePoints = 0, secondServeWon = 0;
        long aces = 0, doubleFaults = 0;
        long serviceGamesPlayed = 0, serviceGamesHeld = 0;
        long returnPoints = 0, returnPointsWon = 0;
        long breakPointsWon = 0, breakPointsTotal = 0;
        long winners = 0, fhWinners = 0, bhWinners = 0, volleyWinners = 0;
        long unforcedErrors = 0, fhUE = 0, bhUE = 0;
        long forcedErrorsDrawn = 0;
        long netWon = 0, netTotal = 0;
    }
}