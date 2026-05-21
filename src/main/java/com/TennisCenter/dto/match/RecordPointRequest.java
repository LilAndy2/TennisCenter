package com.TennisCenter.dto.match;

import lombok.Data;

@Data
public class RecordPointRequest {

    /** ID of the player who won the point. */
    private Long pointWinnerId;

    /** FIRST_SERVE or SECOND_SERVE. */
    private String serveType;

    /** ACE, DOUBLE_FAULT, WINNER, UNFORCED_ERROR, FORCED_ERROR, POINT_WON. */
    private String pointOutcome;

    /** FOREHAND, BACKHAND, VOLLEY — null for ace/double-fault/generic point won. */
    private String shotType;
}