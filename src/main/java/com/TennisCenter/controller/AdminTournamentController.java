package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.model.TournamentStatus;
import com.TennisCenter.model.User;
import com.TennisCenter.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tournaments")
@RequiredArgsConstructor
public class AdminTournamentController {

    private final TournamentService tournamentService;

    @GetMapping("/ongoing")
    public List<TournamentResponse> getOngoingTournaments() {
        return tournamentService.getTournamentsByStatus(TournamentStatus.ONGOING);
    }

    @GetMapping("/upcoming")
    public List<TournamentResponse> getUpcomingTournaments() {
        return tournamentService.getTournamentsByStatus(TournamentStatus.UPCOMING);
    }

    @PostMapping
    public TournamentResponse createTournament(
            @RequestBody CreateTournamentRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.createTournament(request, currentUser);
    }
}
