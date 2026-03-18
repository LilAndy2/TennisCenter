package com.TennisCenter.dto.tournament;

import lombok.Data;
import lombok.Builder;

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
}
