package com.TennisCenter.dto.profile;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CareerStatsResponse {

    private int totalMatches;
    private int wins;
    private int losses;
    private double winRate;
    private int titlesCount;
    private int finalsCount;
    private int currentStreak;
    private int longestWinStreak;
    private double avgPointsPerMatch;

    private double firstServePercentage;
    private double firstServePointsWonPct;
    private double secondServePointsWonPct;
    private double acesPerMatch;
    private double doubleFaultsPerMatch;
    private double aceToDoubleFaultRatio;
    private double serviceGamesHeldPct;

    private double returnPointsWonPct;
    private double breakPointsConvertedPct;

    private double winnersPerMatch;
    private double fhWinnersPerMatch;
    private double bhWinnersPerMatch;
    private double volleyWinnersPerMatch;
    private double unforcedErrorsPerMatch;
    private double fhUnforcedErrorsPerMatch;
    private double bhUnforcedErrorsPerMatch;
    private double winnersToUeRatio;
    private double forcedErrorsDrawnPerMatch;
    private double netApproachSuccessPct;

    private double winRateAfterLosingFirstSet;
    private double decidingSetWinRate;
    private double tiebreakWinRate;

    private double clayWinRate;
    private double hardWinRate;
    private double grassWinRate;
    private int clayMatches;
    private int hardMatches;
    private int grassMatches;

    private List<MatchStatSnapshot> matchTrends;

    private List<Advice> advice;

    @Data
    @Builder
    public static class MatchStatSnapshot {
        private long matchId;
        private String date;
        private boolean won;
        private double firstServePct;
        private double winnersToUeRatio;
        private int winners;
        private int unforcedErrors;
        private int aces;
        private int doubleFaults;
        private String surface;
        private String opponentName;
    }

    @Data
    @Builder
    public static class Advice {
        private String category;
        private String severity;
        private String title;
        private String message;
    }
}