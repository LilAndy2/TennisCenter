package com.TennisCenter.dto.match;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ScheduledMatchResponse {
    private Long matchId;
    private String scheduledTime;
    private String playerOneName;
    private String playerTwoName;
    private String tournamentName;
    private String tournamentLevel;
    private Long courtId;
    private Integer courtNumber;
    private Long locationId;
    private String locationName;
    private String matchDate;
    private String status;
    private String winnerName;
}