package com.TennisCenter.dto.match;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class MatchSetResponse {
    private Integer setNumber;
    private Integer playerOneGames;
    private Integer playerTwoGames;
    private Integer playerOneTiebreakPoints;
    private Integer playerTwoTiebreakPoints;
}
