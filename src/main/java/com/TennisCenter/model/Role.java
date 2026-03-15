package com.TennisCenter.model;

public enum Role {
    ADMIN,
    PLAYER;

    public String getDisplayName() {
        return this.name().substring(0, 1).toUpperCase() + this.name().substring(1).toLowerCase();
    }
}
