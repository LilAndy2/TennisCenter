package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.TournamentResponse;
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
}
