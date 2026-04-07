package com.TennisCenter.service.standing;

import com.TennisCenter.model.User;

/**
 * Accumulates wins, losses, sets and games for a single player
 * across all their matches in a round-robin group.
 * Used by GroupStandingService to compute standings.
 */
public class GroupStandingAccumulator {

    public final User user;

    public int wins   = 0;
    public int losses = 0;
    public int setsWon    = 0;
    public int setsLost   = 0;
    public int gamesWon   = 0;
    public int gamesLost  = 0;

    public GroupStandingAccumulator(User user) {
        this.user = user;
    }

    public int getWins() {
        return wins;
    }

    public double getSetsWinPercentage() {
        int total = setsWon + setsLost;
        return total == 0 ? 0.0 : ((double) setsWon / total) * 100.0;
    }

    public double getGamesWinPercentage() {
        int total = gamesWon + gamesLost;
        return total == 0 ? 0.0 : ((double) gamesWon / total) * 100.0;
    }
}