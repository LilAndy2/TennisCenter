package com.TennisCenter.controller;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.service.TournamentMatchService;
import com.TennisCenter.service.TournamentService;
import com.TennisCenter.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final TournamentMatchService tournamentMatchService;

    @GetMapping
    public List<TournamentResponse> getAllTournaments(
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getAllTournaments(currentUser);
    }

    @GetMapping("/{id}")
    public TournamentResponse getTournamentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getTournamentById(id, currentUser);
    }

    @GetMapping("/{id}/matches")
    public List<TournamentMatchResponse> getTournamentMatches(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.getTournamentMatches(id, currentUser);
    }
}
