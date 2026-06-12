package com.TennisCenter.dto.h2h;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class H2HResponse {

    private PlayerSummary playerA;
    private PlayerSummary playerB;

    private int playerAWins;
    private int playerBWins;
    private int totalMatches;

    private List<H2HMatch> pastMatches;

    private List<H2HMatch> upcomingMatches;

    private Prediction prediction;

    @Data
    @Builder
    public static class PlayerSummary {
        private Long id;
        private String fullName;
        private String level;
        private int eloRating;
        private int wins;
        private int losses;
        private double winRate;
        private int rankingPoints;
    }

    @Data
    @Builder
    public static class H2HMatch {
        private Long matchId;
        private String tournamentName;
        private String surface;
        private String date;
        private String score;
        private Long winnerId;
        private String status;
    }

    @Data
    @Builder
    public static class Prediction {
        private double playerAWinProbability;
        private double playerBWinProbability;
        private List<FeatureContribution> topFeatures;
        private String confidence;
        private String summary;
    }

    @Data
    @Builder
    public static class FeatureContribution {
        private String name;
        private String displayName;
        private double playerAValue;
        private double playerBValue;
        private double impact;
    }
}