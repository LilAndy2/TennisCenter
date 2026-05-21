package com.TennisCenter.service.match;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

/**
 * Stateful tennis score calculator. Replays points to compute the current score state.
 * Best-of-3 sets with tiebreak at 6-6.
 */
@Getter
public class TennisScoreEngine {

    private final Long playerOneId;
    private final Long playerTwoId;
    private final Long firstServerId;

    // Completed sets
    private final List<CompletedSet> completedSets = new ArrayList<>();

    // Current set state
    private int currentSetNumber = 1;
    private int p1Games = 0;
    private int p2Games = 0;

    // Current game state (regular game: 0,15,30,40,AD)
    private int p1Points = 0; // 0,1,2,3 for 0,15,30,40
    private int p2Points = 0;

    // Tiebreak state
    private boolean inTiebreak = false;
    private int tbP1 = 0;
    private int tbP2 = 0;

    // Server tracking
    private Long currentServerId;

    // Match state
    private boolean matchFinished = false;
    private Long winnerId = null;

    // Current game number within the set (1-based)
    private int currentGameInSet = 1;

    // Break point tracking for stats
    private int p1BreakPointsConverted = 0;
    private int p1BreakPointsFaced = 0;
    private int p2BreakPointsConverted = 0;
    private int p2BreakPointsFaced = 0;

    // Service games tracking
    private int p1ServiceGamesPlayed = 0;
    private int p1ServiceGamesHeld = 0;
    private int p2ServiceGamesPlayed = 0;
    private int p2ServiceGamesHeld = 0;

    public TennisScoreEngine(Long playerOneId, Long playerTwoId, Long firstServerId) {
        this.playerOneId = playerOneId;
        this.playerTwoId = playerTwoId;
        this.firstServerId = firstServerId;
        this.currentServerId = firstServerId;
    }

    /**
     * Returns the score state BEFORE processing a new point (for recording).
     */
    public String getCurrentScoreString() {
        if (inTiebreak) {
            return tbP1 + "-" + tbP2;
        }
        return pointToString(p1Points, p2Points);
    }

    /**
     * Process a point won by the given player.
     * Returns true if a game was completed by this point.
     */
    public boolean processPoint(Long pointWinnerId) {
        if (matchFinished) {
            throw new IllegalStateException("Match is already finished");
        }

        if (inTiebreak) {
            return processTiebreakPoint(pointWinnerId);
        } else {
            return processRegularPoint(pointWinnerId);
        }
    }

    /**
     * Check if the current score state represents a break point.
     * A break point is when the returner is one point away from winning the game.
     */
    public boolean isBreakPoint() {
        if (inTiebreak) return false;

        boolean p1Serving = currentServerId.equals(playerOneId);
        if (p1Serving) {
            // Break point for p2 if p2 is at 40 (index 3) and p1 is at 0-30,
            // or if p2 has advantage
            if (p2Points >= 3 && p1Points < 3) return true;
            if (p1Points >= 3 && p2Points >= 3) {
                // Deuce or advantage situation
                return p2Points > p1Points; // p2 has advantage = break point
            }
            return false;
        } else {
            // Break point for p1
            if (p1Points >= 3 && p2Points < 3) return true;
            if (p1Points >= 3 && p2Points >= 3) {
                return p1Points > p2Points;
            }
            return false;
        }
    }

    private boolean processRegularPoint(Long pointWinnerId) {
        boolean isP1 = pointWinnerId.equals(playerOneId);

        // Track break points before processing
        boolean wasBreakPoint = isBreakPoint();
        boolean p1Serving = currentServerId.equals(playerOneId);

        if (wasBreakPoint) {
            if (p1Serving) {
                p2BreakPointsFaced++;
            } else {
                p1BreakPointsFaced++;
            }
        }

        if (isP1) {
            p1Points++;
        } else {
            p2Points++;
        }

        // Check if game is won
        if (p1Points >= 4 || p2Points >= 4) {
            if (p1Points >= 3 && p2Points >= 3) {
                // Deuce rules
                if (Math.abs(p1Points - p2Points) >= 2) {
                    Long gameWinner = p1Points > p2Points ? playerOneId : playerTwoId;
                    handleGameWon(gameWinner);

                    if (wasBreakPoint && !gameWinner.equals(currentServerId)) {
                        // Break was converted - but server already switched in handleGameWon
                        // We need to check who the server was before the switch
                        if (p1Serving && gameWinner.equals(playerTwoId)) {
                            p2BreakPointsConverted++;
                        } else if (!p1Serving && gameWinner.equals(playerOneId)) {
                            p1BreakPointsConverted++;
                        }
                    }
                    return true;
                }
                // Still in deuce — no game won yet
                return false;
            } else {
                // One player reached 4 and other hasn't reached 3 yet
                Long gameWinner = p1Points >= 4 ? playerOneId : playerTwoId;

                if (wasBreakPoint) {
                    if (p1Serving && gameWinner.equals(playerTwoId)) {
                        p2BreakPointsConverted++;
                    } else if (!p1Serving && gameWinner.equals(playerOneId)) {
                        p1BreakPointsConverted++;
                    }
                }

                handleGameWon(gameWinner);
                return true;
            }
        }

        return false;
    }

    private boolean processTiebreakPoint(Long pointWinnerId) {
        boolean isP1 = pointWinnerId.equals(playerOneId);
        if (isP1) {
            tbP1++;
        } else {
            tbP2++;
        }

        // Check tiebreak win (first to 7 with 2-point lead)
        if ((tbP1 >= 7 || tbP2 >= 7) && Math.abs(tbP1 - tbP2) >= 2) {
            Long tbWinner = tbP1 > tbP2 ? playerOneId : playerTwoId;

            // Record the tiebreak result as a game
            if (tbWinner.equals(playerOneId)) {
                p1Games = 7;
            } else {
                p2Games = 7;
            }

            // Store tiebreak points in set
            completedSets.add(new CompletedSet(currentSetNumber, p1Games, p2Games, tbP1, tbP2));
            handleSetWon(tbWinner);
            return true;
        }

        // Serve changes every 2 points in tiebreak (after first point, then every 2)
        int totalTbPoints = tbP1 + tbP2;
        if (totalTbPoints == 1 || (totalTbPoints > 1 && (totalTbPoints - 1) % 2 == 0)) {
            switchServer();
        }

        return false;
    }

    private void handleGameWon(Long gameWinnerId) {
        boolean p1Serving = currentServerId.equals(playerOneId);

        // Track service game stats
        if (p1Serving) {
            p1ServiceGamesPlayed++;
            if (gameWinnerId.equals(playerOneId)) {
                p1ServiceGamesHeld++;
            }
        } else {
            p2ServiceGamesPlayed++;
            if (gameWinnerId.equals(playerTwoId)) {
                p2ServiceGamesHeld++;
            }
        }

        if (gameWinnerId.equals(playerOneId)) {
            p1Games++;
        } else {
            p2Games++;
        }

        // Reset game points
        p1Points = 0;
        p2Points = 0;
        currentGameInSet++;

        // Check if set is won
        if (isSetWon()) {
            Long setWinner = p1Games > p2Games ? playerOneId : playerTwoId;
            completedSets.add(new CompletedSet(currentSetNumber, p1Games, p2Games, null, null));
            handleSetWon(setWinner);
        } else if (p1Games == 6 && p2Games == 6) {
            // Enter tiebreak
            inTiebreak = true;
            tbP1 = 0;
            tbP2 = 0;
            switchServer();
        } else {
            switchServer();
        }
    }

    private boolean isSetWon() {
        if (p1Games >= 6 && p1Games - p2Games >= 2) return true;
        if (p2Games >= 6 && p2Games - p1Games >= 2) return true;
        return false;
    }

    private void handleSetWon(Long setWinnerId) {
        int p1SetsWon = 0;
        int p2SetsWon = 0;
        for (CompletedSet cs : completedSets) {
            if (cs.playerOneGames > cs.playerTwoGames) p1SetsWon++;
            else p2SetsWon++;
        }

        if (p1SetsWon >= 2 || p2SetsWon >= 2) {
            matchFinished = true;
            winnerId = p1SetsWon >= 2 ? playerOneId : playerTwoId;
        } else {
            // New set
            currentSetNumber++;
            p1Games = 0;
            p2Games = 0;
            p1Points = 0;
            p2Points = 0;
            inTiebreak = false;
            tbP1 = 0;
            tbP2 = 0;
            currentGameInSet = 1;
            switchServer();
        }
    }

    private void switchServer() {
        currentServerId = currentServerId.equals(playerOneId) ? playerTwoId : playerOneId;
    }

    private String pointToString(int p1, int p2) {
        String[] labels = {"0", "15", "30", "40"};
        if (p1 < 3 || p2 < 3) {
            // At least one hasn't reached 40 yet
            String s1 = p1 <= 3 ? labels[Math.min(p1, 3)] : "40";
            String s2 = p2 <= 3 ? labels[Math.min(p2, 3)] : "40";
            return s1 + "-" + s2;
        }
        // Both at 40 or beyond
        if (p1 == p2) return "40-40";
        if (p1 > p2) return "AD-40";
        return "40-AD";
    }

    @Getter
    public static class CompletedSet {
        private final int setNumber;
        private final int playerOneGames;
        private final int playerTwoGames;
        private final Integer playerOneTiebreakPoints;
        private final Integer playerTwoTiebreakPoints;

        public CompletedSet(int setNumber, int p1Games, int p2Games,
                            Integer p1TbPoints, Integer p2TbPoints) {
            this.setNumber = setNumber;
            this.playerOneGames = p1Games;
            this.playerTwoGames = p2Games;
            this.playerOneTiebreakPoints = p1TbPoints;
            this.playerTwoTiebreakPoints = p2TbPoints;
        }
    }
}