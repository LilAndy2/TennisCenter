package com.TennisCenter.dto.match;

import lombok.Data;

@Data
public class ScheduleMatchRequest {
    private String scheduledTime;
    private Long courtId;
}