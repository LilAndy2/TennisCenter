package com.TennisCenter.dto.profile;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MatchHistoryResponse {
    private Long matchId;
    private String matchDate;
    private String round;
    private String winnerName;
    private Long winnerId;
    private String loserName;
    private Long loserId;
    private List<SetScoreResponse> sets;
    private boolean profilePlayerWon;
    private Long tournamentId;
    private String tournamentName;
    private String surface;
    private Integer tournamentStartYear;
    private boolean hasStats;

    @Data
    @Builder
    public static class SetScoreResponse {
        private Integer winnerGames;
        private Integer loserGames;
        private Integer loserTiebreakPoints;
    }
}