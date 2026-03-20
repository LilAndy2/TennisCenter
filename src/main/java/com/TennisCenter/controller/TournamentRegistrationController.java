package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.TournamentParticipantResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.TournamentRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/tournaments")
@RequiredArgsConstructor
public class TournamentRegistrationController {

    private final TournamentRegistrationService tournamentRegistrationService;

    @PostMapping("/{id}/register")
    public TournamentResponse registerToTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentRegistrationService.registerToTournament(id, currentUser);
    }

    @DeleteMapping("/{id}/register")
    public TournamentResponse withdrawFromTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentRegistrationService.withdrawFromTournament(id, currentUser);
    }

    @GetMapping("/{id}/participants")
    public List<TournamentParticipantResponse> getParticipants(
            @PathVariable Long id
    ) {
        return tournamentRegistrationService.getParticipants(id);
    }
}