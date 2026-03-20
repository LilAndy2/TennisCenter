package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.model.User;
import com.TennisCenter.service.TournamentRegistrationService;
import com.TennisCenter.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tournaments")
@RequiredArgsConstructor
public class AdminTournamentController {

    private final TournamentService tournamentService;
    private final TournamentRegistrationService tournamentRegistrationService;

    @GetMapping("/ongoing")
    public List<TournamentResponse> getOngoingTournaments(
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getTournamentsByStatus(TournamentStatus.ONGOING, currentUser);
    }

    @GetMapping("/upcoming")
    public List<TournamentResponse> getUpcomingTournaments(
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getTournamentsByStatus(TournamentStatus.UPCOMING, currentUser);
    }

    @PostMapping
    public TournamentResponse createTournament(
            @RequestBody CreateTournamentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.createTournament(request, currentUser);
    }

    @PutMapping("/{id}")
    public TournamentResponse updateTournament(
            @PathVariable Long id,
            @RequestBody CreateTournamentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.updateTournament(id, request, currentUser);
    }

    @DeleteMapping("/{id}")
    public void deleteTournament(
            @PathVariable Long id
    ) {
        tournamentService.deleteTournament(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{tournamentId}/participants/{playerId}")
    public void removeParticipant(
            @PathVariable Long tournamentId,
            @PathVariable Long playerId
    ) {
        tournamentRegistrationService.removeParticipantByAdmin(tournamentId, playerId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/start")
    public TournamentResponse startTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.startTournament(id, currentUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/finish")
    public TournamentResponse finishTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.finishTournament(id, currentUser);
    }
}
