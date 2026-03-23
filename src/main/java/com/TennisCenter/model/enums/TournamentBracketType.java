package com.TennisCenter.model.enums;

public enum TournamentBracketType {
    SINGLE_ELIMINATION,
    ROUND_ROBIN_THEN_KNOCKOUT;

    public String getDisplayName() {
        return switch (this) {
            case SINGLE_ELIMINATION -> "Single Elimination";
            case ROUND_ROBIN_THEN_KNOCKOUT -> "Round Robin + Knockout";
        };
    }
}
