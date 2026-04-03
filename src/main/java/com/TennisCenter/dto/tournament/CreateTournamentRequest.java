package com.TennisCenter.dto.tournament;

import lombok.Data;

import java.util.List;

@Data
public class CreateTournamentRequest {
    private String name;
    private String level;
    private String surface;
    private String startDate;
    private String endDate;
    private Integer maxPlayers;
    private String location;
    private String description;
    private String bracketType;
    private List<Long> locationIds;
}
