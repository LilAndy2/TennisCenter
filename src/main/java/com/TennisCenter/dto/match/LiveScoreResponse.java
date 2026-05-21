package com.TennisCenter.dto.match;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class LiveScoreResponse {

    private Long matchId;
    private String playerOneName;
    private String playerTwoName;
    private Long playerOneId;
    private Long playerTwoId;

    /** Current server player ID. */
    private Long serverId;

    /** Current point score, e.g. "30-15" or "AD-40". */
    private String currentGameScore;

    /** Sets completed so far. */
    private List<SetScore> sets;

    /** Current set games, e.g. playerOneGames=3, playerTwoGames=2. */
    private int currentSetPlayerOneGames;
    private int currentSetPlayerTwoGames;

    /** Whether we are in a tiebreak. */
    private boolean inTiebreak;

    /** Tiebreak points if in tiebreak. */
    private Integer tiebreakPlayerOnePoints;
    private Integer tiebreakPlayerTwoPoints;

    /** Whether the match is finished after this point. */
    private boolean matchFinished;

    /** Winner ID if match is finished. */
    private Long winnerId;

    /** Total points played. */
    private int totalPoints;

    /** The last recorded point number (for undo). */
    private Integer lastPointNumber;

    @Data
    @Builder
    public static class SetScore {
        private int setNumber;
        private int playerOneGames;
        private int playerTwoGames;
        private Integer playerOneTiebreakPoints;
        private Integer playerTwoTiebreakPoints;
    }
}