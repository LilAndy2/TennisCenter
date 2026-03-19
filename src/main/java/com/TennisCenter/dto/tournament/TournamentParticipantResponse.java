package com.TennisCenter.dto.tournament;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TournamentParticipantResponse {
    private Long id;
    private String fullName;
    private String email;
    private String registeredAt;
}
