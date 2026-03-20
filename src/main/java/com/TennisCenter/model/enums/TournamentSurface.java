package com.TennisCenter.model.enums;

public enum TournamentSurface {
    CLAY,
    HARD,
    GRASS;

    public String getDisplayName() {
        return this.name().substring(0, 1).toUpperCase() + this.name().substring(1).toLowerCase();
    }
}
