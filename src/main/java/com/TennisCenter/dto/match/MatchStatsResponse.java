package com.TennisCenter.dto.match;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MatchStatsResponse {

    private Long matchId;

    private String playerOneName;
    private String playerTwoName;
    private Long playerOneId;
    private Long playerTwoId;

    private int playerOneAces;
    private int playerTwoAces;

    private int playerOneDoubleFaults;
    private int playerTwoDoubleFaults;

    private String playerOneFirstServesIn;
    private String playerTwoFirstServesIn;

    private String playerOneFirstServePercentage;
    private String playerTwoFirstServePercentage;

    private String playerOneFirstServePointsWon;
    private String playerTwoFirstServePointsWon;

    private String playerOneSecondServePointsWon;
    private String playerTwoSecondServePointsWon;

    private String playerOneReceivingPointsWon;
    private String playerTwoReceivingPointsWon;

    private String playerOneBreakPointsWon;
    private String playerTwoBreakPointsWon;

    private String playerOneNetPointsWon;
    private String playerTwoNetPointsWon;

    private int playerOneForehandWinners;
    private int playerTwoForehandWinners;

    private int playerOneBackhandWinners;
    private int playerTwoBackhandWinners;

    private int playerOneVolleyWinners;
    private int playerTwoVolleyWinners;

    private int playerOneTotalWinners;
    private int playerTwoTotalWinners;

    private int playerOneForehandUnforcedErrors;
    private int playerTwoForehandUnforcedErrors;

    private int playerOneBackhandUnforcedErrors;
    private int playerTwoBackhandUnforcedErrors;

    private int playerOneTotalUnforcedErrors;
    private int playerTwoTotalUnforcedErrors;

    private int playerOneForcedErrors;
    private int playerTwoForcedErrors;

    private int playerOneTotalPointsWon;
    private int playerTwoTotalPointsWon;

    private String playerOneServiceGamesWon;
    private String playerTwoServiceGamesWon;
}