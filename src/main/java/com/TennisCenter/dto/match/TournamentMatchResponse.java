package com.TennisCenter.dto.match;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class TournamentMatchResponse {
    private Long id;
    private Long tournamentId;
    private String phase;
    private String groupName;
    private Integer roundNumber;
    private Integer matchOrder;
    private String status;
    private String matchDate;

    private Long playerOneId;
    private String playerOneName;

    private Long playerTwoId;
    private String playerTwoName;

    private Long winnerId;
    private String winnerName;

    private List<MatchSetResponse> sets;

    private boolean editableByCurrentUser;
}
