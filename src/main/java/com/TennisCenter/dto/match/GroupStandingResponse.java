package com.TennisCenter.dto.match;

import lombok.Data;
import lombok.Builder;

import java.util.List;

@Data
@Builder
public class GroupStandingResponse {
    private String groupName;
    private List<GroupStandingPlayerResponse> players;
}
