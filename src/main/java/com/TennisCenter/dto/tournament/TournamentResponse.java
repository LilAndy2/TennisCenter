package com.TennisCenter.dto.tournament;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class TournamentResponse {
    private Long id;
    private String name;
    private String level;
    private String status;
    private String surface;
    private String startDate;
    private String endDate;
    private Integer maxPlayers;
    private String location;
    private String description;
    private boolean isFull;
    private Integer currentPlayers;
    private boolean registeredByCurrentUser;
    private boolean registrationOpen;
    private boolean registrationAllowedByLevel;
    private boolean currentUserAdmin;
    private String bracketType;
    private List<Long> locationIds;
}
