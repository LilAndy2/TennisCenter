package com.TennisCenter.model.enums;

public enum TournamentStatus {
    UPCOMING,
    ONGOING,
    FINISHED;

    public String getDisplayName() {
        return this.name().substring(0, 1).toUpperCase() + this.name().substring(1).toLowerCase();
    }
}
