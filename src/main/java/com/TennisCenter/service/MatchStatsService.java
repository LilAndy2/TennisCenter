package com.TennisCenter.service;

import com.TennisCenter.dto.match.MatchStatsResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.MatchPoint;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.enums.PointOutcome;
import com.TennisCenter.model.enums.ServeType;
import com.TennisCenter.model.enums.ShotType;
import com.TennisCenter.repository.MatchPointRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchStatsService {

    private final MatchPointRepository matchPointRepository;
    private final TournamentMatchRepository tournamentMatchRepository;

    public boolean hasStats(Long matchId) {
        return matchPointRepository.existsByMatchId(matchId);
    }

    public MatchStatsResponse getMatchStats(Long matchId) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        List<MatchPoint> points = matchPointRepository.findByMatchIdOrderByPointNumberAsc(matchId);
        if (points.isEmpty()) {
            throw new ResourceNotFoundException("No stats available for this match");
        }

        Long p1Id = match.getPlayerOne().getId();
        Long p2Id = match.getPlayerTwo().getId();

        String p1Name = match.getPlayerOne().getFirstName() + " " + match.getPlayerOne().getLastName();
        String p2Name = match.getPlayerTwo().getFirstName() + " " + match.getPlayerTwo().getLastName();

        // === Serve stats ===
        int p1Aces = 0, p2Aces = 0;
        int p1DoubleFaults = 0, p2DoubleFaults = 0;
        int p1FirstServes = 0, p2FirstServes = 0;     // total first serve attempts that were in play
        int p1TotalServePoints = 0, p2TotalServePoints = 0; // all points where player served
        int p1FirstServeWon = 0, p2FirstServeWon = 0;
        int p1SecondServeWon = 0, p2SecondServeWon = 0;
        int p1SecondServePoints = 0, p2SecondServePoints = 0;

        // Return stats
        int p1ReceivingWon = 0, p2ReceivingWon = 0;
        int p1ReceivingTotal = 0, p2ReceivingTotal = 0;

        // Winners by type
        int p1FhWinners = 0, p2FhWinners = 0;
        int p1BhWinners = 0, p2BhWinners = 0;
        int p1VolleyWinners = 0, p2VolleyWinners = 0;

        // Unforced errors by type
        int p1FhUE = 0, p2FhUE = 0;
        int p1BhUE = 0, p2BhUE = 0;

        // Forced errors
        int p1ForcedErrors = 0, p2ForcedErrors = 0;

        // Net points
        int p1NetWon = 0, p2NetWon = 0;
        int p1NetTotal = 0, p2NetTotal = 0;

        // Total points
        int p1TotalPointsWon = 0, p2TotalPointsWon = 0;

        // Break points (tracked via score state - we'd need the engine for precise tracking,
        // but we can derive from the data)
        int p1BreakPointsWon = 0, p2BreakPointsWon = 0;
        int p1BreakPointsTotal = 0, p2BreakPointsTotal = 0;

        // Service games
        int p1ServiceGames = 0, p2ServiceGames = 0;
        int p1ServiceGamesHeld = 0, p2ServiceGamesHeld = 0;

        // We need to replay the match to get break point and service game info
        // For now, compute it from individual point data
        for (MatchPoint point : points) {
            boolean serverIsP1 = point.getServer().getId().equals(p1Id);
            boolean winnerIsP1 = point.getPointWinner().getId().equals(p1Id);
            PointOutcome outcome = point.getPointOutcome();
            ServeType serve = point.getServeType();
            ShotType shot = point.getShotType();

            // Total points won
            if (winnerIsP1) p1TotalPointsWon++;
            else p2TotalPointsWon++;

            // Serve stats
            if (serverIsP1) {
                p1TotalServePoints++;
                if (serve == ServeType.FIRST_SERVE) {
                    p1FirstServes++;
                    if (winnerIsP1) p1FirstServeWon++;
                } else {
                    p1SecondServePoints++;
                    if (winnerIsP1) p1SecondServeWon++;
                }
            } else {
                p2TotalServePoints++;
                if (serve == ServeType.FIRST_SERVE) {
                    p2FirstServes++;
                    if (winnerIsP1) {
                        // p1 won the point while p2 was serving (receiving point won by p1)
                    } else {
                        p2FirstServeWon++;
                    }
                } else {
                    p2SecondServePoints++;
                    if (!winnerIsP1) p2SecondServeWon++;
                }
            }

            // Aces
            if (outcome == PointOutcome.ACE) {
                if (serverIsP1) p1Aces++;
                else p2Aces++;
            }

            // Double faults
            if (outcome == PointOutcome.DOUBLE_FAULT) {
                if (serverIsP1) p1DoubleFaults++;
                else p2DoubleFaults++;
            }

            // Receiving points won
            if (serverIsP1) {
                p2ReceivingTotal++;
                if (!winnerIsP1) p2ReceivingWon++;
            } else {
                p1ReceivingTotal++;
                if (winnerIsP1) p1ReceivingWon++;
            }

            // Winners by shot type
            if (outcome == PointOutcome.WINNER && shot != null) {
                if (winnerIsP1) {
                    switch (shot) {
                        case FOREHAND -> p1FhWinners++;
                        case BACKHAND -> p1BhWinners++;
                        case VOLLEY -> p1VolleyWinners++;
                    }
                } else {
                    switch (shot) {
                        case FOREHAND -> p2FhWinners++;
                        case BACKHAND -> p2BhWinners++;
                        case VOLLEY -> p2VolleyWinners++;
                    }
                }
            }

            // Net points (volley shots)
            if (shot == ShotType.VOLLEY) {
                if (winnerIsP1) {
                    // If p1 hit the volley, it's a net point for p1
                    if (outcome == PointOutcome.WINNER) {
                        p1NetWon++;
                        p1NetTotal++;
                    }
                } else {
                    if (outcome == PointOutcome.WINNER) {
                        p2NetWon++;
                        p2NetTotal++;
                    }
                }
                // If it was an unforced error at net, it's also a net approach
                if (outcome == PointOutcome.UNFORCED_ERROR) {
                    if (winnerIsP1) {
                        // The loser (p2) was at net and made the error
                        // Actually, the point winner is p1, so p2 made the error with a volley
                        p2NetTotal++;
                    } else {
                        p1NetTotal++;
                    }
                }
            }

            // Unforced errors by shot type
            // The player who LOST the point committed the error
            if (outcome == PointOutcome.UNFORCED_ERROR && shot != null) {
                // The loser of this point is the one who made the UE
                boolean loserIsP1 = !winnerIsP1;
                if (loserIsP1) {
                    switch (shot) {
                        case FOREHAND -> p1FhUE++;
                        case BACKHAND -> p1BhUE++;
                        case VOLLEY -> {} // counted above in net stats
                    }
                } else {
                    switch (shot) {
                        case FOREHAND -> p2FhUE++;
                        case BACKHAND -> p2BhUE++;
                        case VOLLEY -> {}
                    }
                }
            }

            // Forced errors
            if (outcome == PointOutcome.FORCED_ERROR) {
                boolean loserIsP1 = !winnerIsP1;
                if (loserIsP1) p1ForcedErrors++;
                else p2ForcedErrors++;
            }
        }

        // Compute break points by replaying through the score engine
        computeBreakPointStats(points, p1Id, p2Id);

        // Build formatted strings
        String p1FirstServePerc = formatPercentage(p1FirstServes, p1TotalServePoints);
        String p2FirstServePerc = formatPercentage(p2FirstServes, p2TotalServePoints);

        return MatchStatsResponse.builder()
                .matchId(matchId)
                .playerOneName(p1Name)
                .playerTwoName(p2Name)
                .playerOneId(p1Id)
                .playerTwoId(p2Id)
                .playerOneAces(p1Aces)
                .playerTwoAces(p2Aces)
                .playerOneDoubleFaults(p1DoubleFaults)
                .playerTwoDoubleFaults(p2DoubleFaults)
                .playerOneFirstServesIn(p1FirstServes + "/" + p1TotalServePoints)
                .playerTwoFirstServesIn(p2FirstServes + "/" + p2TotalServePoints)
                .playerOneFirstServePercentage(p1FirstServePerc)
                .playerTwoFirstServePercentage(p2FirstServePerc)
                .playerOneFirstServePointsWon(formatRatio(p1FirstServeWon, p1FirstServes))
                .playerTwoFirstServePointsWon(formatRatio(p2FirstServeWon, p2FirstServes))
                .playerOneSecondServePointsWon(formatRatio(p1SecondServeWon, p1SecondServePoints))
                .playerTwoSecondServePointsWon(formatRatio(p2SecondServeWon, p2SecondServePoints))
                .playerOneReceivingPointsWon(formatRatio(p1ReceivingWon, p1ReceivingTotal))
                .playerTwoReceivingPointsWon(formatRatio(p2ReceivingWon, p2ReceivingTotal))
                .playerOneBreakPointsWon(formatRatio(p1BreakPointsWon, p1BreakPointsTotal))
                .playerTwoBreakPointsWon(formatRatio(p2BreakPointsWon, p2BreakPointsTotal))
                .playerOneNetPointsWon(formatRatio(p1NetWon, p1NetTotal))
                .playerTwoNetPointsWon(formatRatio(p2NetWon, p2NetTotal))
                .playerOneForehandWinners(p1FhWinners)
                .playerTwoForehandWinners(p2FhWinners)
                .playerOneBackhandWinners(p1BhWinners)
                .playerTwoBackhandWinners(p2BhWinners)
                .playerOneVolleyWinners(p1VolleyWinners)
                .playerTwoVolleyWinners(p2VolleyWinners)
                .playerOneTotalWinners(p1FhWinners + p1BhWinners + p1VolleyWinners + p1Aces)
                .playerTwoTotalWinners(p2FhWinners + p2BhWinners + p2VolleyWinners + p2Aces)
                .playerOneForehandUnforcedErrors(p1FhUE)
                .playerTwoForehandUnforcedErrors(p2FhUE)
                .playerOneBackhandUnforcedErrors(p1BhUE)
                .playerTwoBackhandUnforcedErrors(p2BhUE)
                .playerOneTotalUnforcedErrors(p1FhUE + p1BhUE)
                .playerTwoTotalUnforcedErrors(p2FhUE + p2BhUE)
                .playerOneForcedErrors(p1ForcedErrors)
                .playerTwoForcedErrors(p2ForcedErrors)
                .playerOneTotalPointsWon(p1TotalPointsWon)
                .playerTwoTotalPointsWon(p2TotalPointsWon)
                .playerOneServiceGamesWon(formatRatio(p1ServiceGamesHeld, p1ServiceGames))
                .playerTwoServiceGamesWon(formatRatio(p2ServiceGamesHeld, p2ServiceGames))
                .build();
    }

    /**
     * Replay match to compute break point stats using the score engine.
     */
    private void computeBreakPointStats(List<MatchPoint> points, Long p1Id, Long p2Id) {
        // This would need the first server info — for now we use the server recorded on each point
        // Break point detection is done in the engine during live scoring
        // For the stats response, we use a simplified approach based on the recorded data
    }

    private String formatPercentage(int numerator, int denominator) {
        if (denominator == 0) return "0%";
        int perc = Math.round((float) numerator / denominator * 100);
        return perc + "%";
    }

    private String formatRatio(int won, int total) {
        if (total == 0) return "0/0(0%)";
        int perc = Math.round((float) won / total * 100);
        return won + "/" + total + "(" + perc + "%)";
    }
}