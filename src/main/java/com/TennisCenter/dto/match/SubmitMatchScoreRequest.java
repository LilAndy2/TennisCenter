package com.TennisCenter.dto.match;

import lombok.Data;

import java.util.List;

@Data
public class SubmitMatchScoreRequest {
    private List<MatchSetScoreRequest> sets;
}
