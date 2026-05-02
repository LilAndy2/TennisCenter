package com.TennisCenter.dto.profile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TitleFinalsResponse {
    private Long tournamentId;
    private String tournamentName;
    private String surface;
    private String tournamentLevel;
    private String date;
    private String opponentName;
    private Long opponentId;
    private String result;
    private boolean won;
}