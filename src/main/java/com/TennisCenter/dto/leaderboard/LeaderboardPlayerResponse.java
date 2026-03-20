package com.TennisCenter.dto.leaderboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardPlayerResponse {
    private Long id;
    private Integer rank;
    private String fullName;
    private String level;
    private Integer wins;
    private Integer losses;
    private Double winRate;
    private Integer points;
}
