package com.TennisCenter.service.match;

import com.TennisCenter.model.MatchPoint;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PointOutcome;
import com.TennisCenter.model.enums.ServeType;
import com.TennisCenter.model.enums.ShotType;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchPointRepository;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Generates realistic synthetic point-by-point data for completed matches
 * that don't have any MatchPoint records yet.
 *
 * The algorithm:
 * 1. Reads the existing set scores (MatchSet rows) for each completed match.
 * 2. For each set, generates a plausible sequence of game outcomes (who won each game)
 *    that produces the correct final game count.
 * 3. For each game, generates individual points with realistic stat distributions
 *    (serve type, point outcome, shot type).
 * 4. Saves all generated MatchPoint rows in bulk.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MatchPointSeederService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;
    private final MatchPointRepository matchPointRepository;

    private static final Random RNG = new Random();

    // ── Probability parameters (amateur-level tennis) ──

    // Server wins the point ~60% of the time on average
    private static final double SERVER_WIN_PROB = 0.60;

    // Of server points won: how often is it an ace vs other
    private static final double ACE_PROB_ON_SERVE_WIN = 0.06;

    // Of server points lost: how often is it a double fault
    private static final double DF_PROB_ON_SERVE_LOSS = 0.08;

    // 1st serve percentage (how often the first serve goes in)
    private static final double FIRST_SERVE_IN_PROB = 0.62;

    // Among rally points (not ace/df): outcome probabilities
    private static final double WINNER_PROB = 0.22;
    private static final double UE_PROB = 0.35;
    private static final double FORCED_ERR_PROB = 0.15;
    // remainder = POINT_WON (generic rally point)

    // Shot type distribution for winners
    private static final double FH_WINNER_PROB = 0.55;
    private static final double BH_WINNER_PROB = 0.30;
    // remainder = VOLLEY

    // Shot type distribution for unforced errors
    private static final double FH_UE_PROB = 0.50;
    private static final double BH_UE_PROB = 0.40;
    // remainder = VOLLEY

    /**
     * Seed all completed matches that have set scores but no point data.
     * Returns the number of matches seeded.
     */
    @Transactional
    public int seedAllCompletedMatches() {
        List<TournamentMatch> completedMatches = tournamentMatchRepository.findAll().stream()
                .filter(m -> m.getStatus() == TournamentMatchStatus.COMPLETED)
                .filter(m -> m.getWinner() != null)
                .filter(m -> m.getPlayerOne() != null && m.getPlayerTwo() != null)
                .toList();

        int seededCount = 0;
        for (TournamentMatch match : completedMatches) {
            // Skip matches that already have point data
            if (matchPointRepository.existsByMatchId(match.getId())) {
                continue;
            }

            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());
            if (sets.isEmpty()) {
                log.warn("Match {} is COMPLETED but has no set scores — skipping", match.getId());
                continue;
            }

            try {
                List<MatchPoint> points = generatePointsForMatch(match, sets);
                matchPointRepository.saveAll(points);
                seededCount++;
                log.info("Seeded match {} ({} vs {}) with {} points",
                        match.getId(),
                        match.getPlayerOne().getFullName(),
                        match.getPlayerTwo().getFullName(),
                        points.size());
            } catch (Exception e) {
                log.error("Failed to seed match {}: {}", match.getId(), e.getMessage());
            }
        }

        return seededCount;
    }

    /**
     * Generate all MatchPoint rows for a single match, given its set scores.
     */
    private List<MatchPoint> generatePointsForMatch(TournamentMatch match, List<MatchSet> sets) {
        User p1 = match.getPlayerOne();
        User p2 = match.getPlayerTwo();
        Long p1Id = p1.getId();
        Long p2Id = p2.getId();

        // Randomly pick who serves first
        Long firstServerId = RNG.nextBoolean() ? p1Id : p2Id;
        Long currentServerId = firstServerId;

        List<MatchPoint> allPoints = new ArrayList<>();
        int globalPointNumber = 0;

        // Use the match's completedAt or matchDate as base time for recordedAt
        LocalDateTime baseTime = match.getCompletedAt() != null
                ? match.getCompletedAt().minusHours(2) // match started ~2h before completion
                : (match.getMatchDate() != null
                ? match.getMatchDate().atTime(10, 0)
                : LocalDateTime.now().minusDays(30));

        for (MatchSet set : sets) {
            int p1TargetGames = set.getPlayerOneGames();
            int p2TargetGames = set.getPlayerTwoGames();
            boolean isTiebreak = (p1TargetGames == 7 && p2TargetGames == 6)
                    || (p1TargetGames == 6 && p2TargetGames == 7);

            // Generate the sequence of game winners for this set
            List<Long> gameWinners = generateGameSequence(
                    p1Id, p2Id, p1TargetGames, p2TargetGames, isTiebreak);

            int gameInSet = 1;
            for (int gi = 0; gi < gameWinners.size(); gi++) {
                Long gameWinner = gameWinners.get(gi);
                boolean isLastGameAndTiebreak = isTiebreak && gi == gameWinners.size() - 1;

                List<PointResult> pointResults;
                if (isLastGameAndTiebreak) {
                    pointResults = generateTiebreakPoints(
                            p1Id, p2Id, gameWinner, currentServerId,
                            set.getPlayerOneTiebreakPoints(),
                            set.getPlayerTwoTiebreakPoints());
                } else {
                    pointResults = generateGamePoints(p1Id, p2Id, gameWinner, currentServerId);
                }

                for (PointResult pr : pointResults) {
                    globalPointNumber++;

                    // Compute score-before using a simple counter within this game
                    // (the engine tracks this precisely, but for seeding we use a simplified approach)
                    String scoreBefore = pr.scoreBefore;

                    MatchPoint mp = MatchPoint.builder()
                            .match(match)
                            .pointWinner(pr.winnerId.equals(p1Id) ? p1 : p2)
                            .server(pr.serverId.equals(p1Id) ? p1 : p2)
                            .pointNumber(globalPointNumber)
                            .setNumber(set.getSetNumber())
                            .gameNumber(gameInSet)
                            .scoreBefore(scoreBefore)
                            .serveType(pr.serveType)
                            .pointOutcome(pr.outcome)
                            .shotType(pr.shotType)
                            .recordedAt(baseTime.plusSeconds(globalPointNumber * 30L))
                            .build();

                    allPoints.add(mp);
                }

                // After tiebreak, server changes are handled differently
                if (isLastGameAndTiebreak) {
                    // After a tiebreak, the player who received first in the TB serves first in the next set
                    currentServerId = currentServerId.equals(p1Id) ? p2Id : p1Id;
                } else {
                    currentServerId = currentServerId.equals(p1Id) ? p2Id : p1Id;
                }
                gameInSet++;
            }
        }

        return allPoints;
    }

    /**
     * Generate the sequence of game winners for a set.
     * Must produce exactly p1Target wins for p1 and p2Target wins for p2.
     * Games alternate service, and we try to create a realistic pattern
     * (mostly service holds with some breaks).
     */
    private List<Long> generateGameSequence(Long p1Id, Long p2Id,
                                            int p1Target, int p2Target,
                                            boolean hasTiebreak) {
        int totalRegularGames = hasTiebreak ? (p1Target + p2Target - 1) : (p1Target + p2Target);
        int p1RegularWins = hasTiebreak
                ? (p1Target == 7 ? 6 : p1Target)
                : p1Target;
        int p2RegularWins = hasTiebreak
                ? (p2Target == 7 ? 6 : p2Target)
                : p2Target;

        // Build a shuffled sequence of game winners for regular games (6-6 before TB)
        List<Long> winners = new ArrayList<>();
        for (int i = 0; i < p1RegularWins; i++) winners.add(p1Id);
        for (int i = 0; i < p2RegularWins; i++) winners.add(p2Id);

        // Shuffle but try to keep it realistic (not all one player's wins clustered)
        // We'll use a simple approach: shuffle and accept
        java.util.Collections.shuffle(winners, RNG);

        // Add tiebreak winner if applicable
        if (hasTiebreak) {
            Long tbWinner = p1Target == 7 ? p1Id : p2Id;
            winners.add(tbWinner);
        }

        return winners;
    }

    /**
     * Generate point-by-point results for a regular service game.
     * The game must end with 'gameWinner' winning.
     */
    private List<PointResult> generateGamePoints(Long p1Id, Long p2Id,
                                                 Long gameWinner, Long serverId) {
        List<PointResult> points = new ArrayList<>();
        int serverPts = 0; // points indexed as 0,1,2,3 = 0,15,30,40
        int returnerPts = 0;

        Long returnerId = serverId.equals(p1Id) ? p2Id : p1Id;
        boolean serverIsWinner = gameWinner.equals(serverId);

        while (true) {
            String scoreBefore = formatGameScore(serverPts, returnerPts, serverId, p1Id);

            // Determine who wins this point
            // Bias toward the game winner, but allow realistic back-and-forth
            boolean serverWinsPoint;
            if (isGamePoint(serverPts, returnerPts, serverIsWinner)) {
                // On game point, bias heavily toward the expected winner
                serverWinsPoint = serverIsWinner ? (RNG.nextDouble() < 0.70) : (RNG.nextDouble() < 0.30);
            } else {
                serverWinsPoint = RNG.nextDouble() < SERVER_WIN_PROB;
            }

            Long pointWinner = serverWinsPoint ? serverId : returnerId;

            // Generate the point outcome
            PointResult pr = generatePointOutcome(pointWinner, serverId, p1Id, p2Id, scoreBefore);
            points.add(pr);

            // Update score
            if (serverWinsPoint) {
                serverPts++;
            } else {
                returnerPts++;
            }

            // Check game end
            if (serverPts >= 4 || returnerPts >= 4) {
                if (serverPts >= 3 && returnerPts >= 3) {
                    if (Math.abs(serverPts - returnerPts) >= 2) {
                        Long actualWinner = serverPts > returnerPts ? serverId : returnerId;
                        if (!actualWinner.equals(gameWinner)) {
                            // Oops, wrong winner — rig the last few points
                            return rigGameForWinner(p1Id, p2Id, gameWinner, serverId);
                        }
                        break;
                    }
                    // Deuce: cap at reasonable length by reducing randomness
                    if (serverPts + returnerPts > 14) {
                        return rigGameForWinner(p1Id, p2Id, gameWinner, serverId);
                    }
                } else {
                    Long actualWinner = serverPts >= 4 ? serverId : returnerId;
                    if (!actualWinner.equals(gameWinner)) {
                        return rigGameForWinner(p1Id, p2Id, gameWinner, serverId);
                    }
                    break;
                }
            }
        }

        return points;
    }

    /**
     * Deterministic fallback: generate a game where the specified player wins
     * with a realistic but controlled point sequence.
     */
    private List<PointResult> rigGameForWinner(Long p1Id, Long p2Id,
                                               Long gameWinner, Long serverId) {
        List<PointResult> points = new ArrayList<>();
        int serverPts = 0;
        int returnerPts = 0;
        Long returnerId = serverId.equals(p1Id) ? p2Id : p1Id;
        boolean serverIsWinner = gameWinner.equals(serverId);

        // Generate a plausible game: winner wins 4, loser wins 0-3
        int loserPoints = RNG.nextInt(4); // 0, 1, 2, or 3 points for the loser

        // Create a sequence: loserPoints losses and 4 wins, shuffled
        List<Boolean> sequence = new ArrayList<>();
        for (int i = 0; i < 4; i++) sequence.add(true); // winner's points
        for (int i = 0; i < loserPoints; i++) sequence.add(false); // loser's points
        java.util.Collections.shuffle(sequence, RNG);

        // Ensure the last point is won by the winner
        sequence.remove(Boolean.TRUE);
        sequence.add(true);

        for (boolean winnerWinsThis : sequence) {
            String scoreBefore = formatGameScore(serverPts, returnerPts, serverId, p1Id);

            boolean serverWinsPoint = (serverIsWinner == winnerWinsThis);
            Long pointWinner = serverWinsPoint ? serverId : returnerId;

            PointResult pr = generatePointOutcome(pointWinner, serverId, p1Id, p2Id, scoreBefore);
            points.add(pr);

            if (serverWinsPoint) serverPts++;
            else returnerPts++;
        }

        return points;
    }

    /**
     * Generate point-by-point results for a tiebreak.
     */
    private List<PointResult> generateTiebreakPoints(Long p1Id, Long p2Id,
                                                     Long tbWinner, Long firstServerInTB,
                                                     Integer p1TbPoints, Integer p2TbPoints) {
        // If we have the actual tiebreak score, use it; otherwise generate one
        int targetP1 = p1TbPoints != null ? p1TbPoints : 0;
        int targetP2 = p2TbPoints != null ? p2TbPoints : 0;

        // If tiebreak points aren't stored, generate a plausible score
        if (targetP1 == 0 && targetP2 == 0) {
            if (tbWinner.equals(p1Id)) {
                targetP2 = RNG.nextInt(6); // loser gets 0-5
                targetP1 = Math.max(7, targetP2 + 2);
            } else {
                targetP1 = RNG.nextInt(6);
                targetP2 = Math.max(7, targetP1 + 2);
            }
        }

        List<PointResult> points = new ArrayList<>();

        // Build point sequence: targetP1 wins for p1, targetP2 wins for p2
        List<Long> pointWinners = new ArrayList<>();
        for (int i = 0; i < targetP1; i++) pointWinners.add(p1Id);
        for (int i = 0; i < targetP2; i++) pointWinners.add(p2Id);

        // Shuffle all but the last point (which must go to the winner)
        if (pointWinners.size() > 1) {
            Long last = pointWinners.remove(pointWinners.size() - 1);
            java.util.Collections.shuffle(pointWinners, RNG);

            // Make sure the last point is won by the tiebreak winner
            // Remove one tbWinner point from the shuffled portion and put it at the end
            pointWinners.add(tbWinner);
            // We may have shifted one extra of the non-winner to the end, so we need to
            // adjust: remove one tbWinner from inside and put the displaced 'last' back
            if (!last.equals(tbWinner)) {
                // Find and remove one tbWinner from shuffled list (not the last one)
                for (int i = 0; i < pointWinners.size() - 1; i++) {
                    if (pointWinners.get(i).equals(tbWinner)) {
                        pointWinners.set(i, last);
                        break;
                    }
                }
            }
        }

        // Track TB server (alternates every 2 points after the first)
        Long currentServer = firstServerInTB;
        int tbP1 = 0, tbP2 = 0;

        for (int i = 0; i < pointWinners.size(); i++) {
            String scoreBefore = tbP1 + "-" + tbP2;
            Long pointWinner = pointWinners.get(i);

            PointResult pr = generatePointOutcome(pointWinner, currentServer, p1Id, p2Id, scoreBefore);
            points.add(pr);

            if (pointWinner.equals(p1Id)) tbP1++;
            else tbP2++;

            // Server switch logic: after 1st point, then every 2 points
            int totalPlayed = i + 1;
            if (totalPlayed == 1 || (totalPlayed > 1 && (totalPlayed - 1) % 2 == 0)) {
                currentServer = currentServer.equals(p1Id) ? p2Id : p1Id;
            }
        }

        return points;
    }

    /**
     * Generate a single point's outcome (serve type, point outcome, shot type).
     */
    private PointResult generatePointOutcome(Long pointWinner, Long serverId,
                                             Long p1Id, Long p2Id,
                                             String scoreBefore) {
        boolean serverWon = pointWinner.equals(serverId);

        // Determine serve type
        ServeType serveType;
        if (RNG.nextDouble() < FIRST_SERVE_IN_PROB) {
            serveType = ServeType.FIRST_SERVE;
        } else {
            serveType = ServeType.SECOND_SERVE;
        }

        PointOutcome outcome;
        ShotType shotType = null;

        if (serverWon) {
            // Server won the point
            double roll = RNG.nextDouble();
            if (roll < ACE_PROB_ON_SERVE_WIN) {
                outcome = PointOutcome.ACE;
                // Aces almost always on first serve
                serveType = ServeType.FIRST_SERVE;
            } else {
                // Rally point won by server
                outcome = pickRallyOutcome(true);
                shotType = pickShotType(outcome);
            }
        } else {
            // Returner won the point
            double roll = RNG.nextDouble();
            if (roll < DF_PROB_ON_SERVE_LOSS) {
                outcome = PointOutcome.DOUBLE_FAULT;
                serveType = ServeType.SECOND_SERVE; // DFs always on second serve
            } else {
                outcome = pickRallyOutcome(false);
                shotType = pickShotType(outcome);
            }
        }

        return new PointResult(pointWinner, serverId, serveType, outcome, shotType, scoreBefore);
    }

    /**
     * Pick a rally outcome for a point (winner, UE, forced error, or generic point won).
     * @param serverWon whether the server won this point (affects UE attribution direction)
     */
    private PointOutcome pickRallyOutcome(boolean serverWon) {
        double roll = RNG.nextDouble();
        if (roll < WINNER_PROB) {
            return PointOutcome.WINNER;
        } else if (roll < WINNER_PROB + UE_PROB) {
            return PointOutcome.UNFORCED_ERROR;
        } else if (roll < WINNER_PROB + UE_PROB + FORCED_ERR_PROB) {
            return PointOutcome.FORCED_ERROR;
        } else {
            return PointOutcome.POINT_WON;
        }
    }

    /**
     * Pick a shot type based on the outcome.
     */
    private ShotType pickShotType(PointOutcome outcome) {
        if (outcome == PointOutcome.ACE || outcome == PointOutcome.DOUBLE_FAULT
                || outcome == PointOutcome.POINT_WON) {
            return null;
        }

        double roll = RNG.nextDouble();
        if (outcome == PointOutcome.WINNER) {
            if (roll < FH_WINNER_PROB) return ShotType.FOREHAND;
            if (roll < FH_WINNER_PROB + BH_WINNER_PROB) return ShotType.BACKHAND;
            return ShotType.VOLLEY;
        } else {
            // UE or forced error
            if (roll < FH_UE_PROB) return ShotType.FOREHAND;
            if (roll < FH_UE_PROB + BH_UE_PROB) return ShotType.BACKHAND;
            return ShotType.VOLLEY;
        }
    }

    /**
     * Check if the current score is a game point for the expected game winner.
     */
    private boolean isGamePoint(int serverPts, int returnerPts, boolean serverIsExpectedWinner) {
        if (serverIsExpectedWinner) {
            // Game point if server is at 40 (3) and returner is at anything below, or server has AD
            return serverPts >= 3 && serverPts > returnerPts;
        } else {
            return returnerPts >= 3 && returnerPts > serverPts;
        }
    }

    /**
     * Format the score before a point in a regular game.
     * Score is always from p1's perspective in the stored format.
     */
    private String formatGameScore(int serverPts, int returnerPts,
                                   Long serverId, Long p1Id) {
        String[] labels = {"0", "15", "30", "40"};

        int p1Pts, p2Pts;
        if (serverId.equals(p1Id)) {
            p1Pts = serverPts;
            p2Pts = returnerPts;
        } else {
            p1Pts = returnerPts;
            p2Pts = serverPts;
        }

        if (p1Pts < 3 || p2Pts < 3) {
            String s1 = p1Pts <= 3 ? labels[Math.min(p1Pts, 3)] : "40";
            String s2 = p2Pts <= 3 ? labels[Math.min(p2Pts, 3)] : "40";
            return s1 + "-" + s2;
        }
        if (p1Pts == p2Pts) return "40-40";
        if (p1Pts > p2Pts) return "AD-40";
        return "40-AD";
    }

    /**
     * Internal record for a generated point result.
     */
    private record PointResult(
            Long winnerId,
            Long serverId,
            ServeType serveType,
            PointOutcome outcome,
            ShotType shotType,
            String scoreBefore
    ) {}
}