package com.TennisCenter.model.enums;

public enum TournamentLevel {
    ENTRY,
    STARTER,
    MEDIUM,
    MASTER,
    EXPERT,
    STELLAR;

    public String getDisplayName() {
        return this.name().substring(0, 1).toUpperCase() + this.name().substring(1).toLowerCase();
    }
}
