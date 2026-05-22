package com.TennisCenter.controller;

import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.match.PlayerMatchService;
import com.TennisCenter.service.match.TournamentMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/matches")
@RequiredArgsConstructor
public class PlayerMatchController {

    private final PlayerMatchService playerMatchService;
    private final TournamentMatchService tournamentMatchService;

    @GetMapping("/my-matches")
    public List<TournamentMatchResponse> getMyActiveMatches(
            @AuthenticationPrincipal User currentUser
    ) {
        return playerMatchService.getMyActiveMatches(currentUser);
    }

    @PutMapping("/{matchId}/score")
    public TournamentMatchResponse submitMatchScore(
            @PathVariable Long matchId,
            @RequestBody SubmitMatchScoreRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.playerSubmitMatchScore(matchId, request, currentUser);
    }
}