package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.service.TournamentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    @GetMapping
    public List<TournamentResponse> getAllTournaments() {
        return tournamentService.getAllTournaments();
    }

    @GetMapping("/{id}")
    public TournamentResponse getTournamentById(
            @PathVariable Long id
    ) {
        return tournamentService.getTournamentById(id);
    }
}
