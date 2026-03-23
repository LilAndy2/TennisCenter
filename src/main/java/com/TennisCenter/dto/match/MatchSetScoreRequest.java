package com.TennisCenter.dto.match;

import lombok.Data;

@Data
public class MatchSetScoreRequest {
    private Integer setNumber;
    private Integer playerOneGames;
    private Integer playerTwoGames;
    private Integer playerOneTiebreakPoints;
    private Integer playerTwoTiebreakPoints;
}
