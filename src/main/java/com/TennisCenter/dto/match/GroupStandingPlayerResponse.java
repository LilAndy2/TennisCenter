package com.TennisCenter.dto.match;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GroupStandingPlayerResponse {
    private Long playerId;
    private Integer position;
    private String playerName;
    private Integer wins;
    private Integer losses;
    private Double setsWinPercentage;
    private Double gamesWinPercentage;
}
