package com.TennisCenter.controller;

import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.TournamentMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/matches")
@RequiredArgsConstructor
public class AdminMatchController {

    private final TournamentMatchService tournamentMatchService;

    @PutMapping("/{matchId}/score")
    public TournamentMatchResponse submitMatchScore(
            @PathVariable Long matchId,
            @RequestBody SubmitMatchScoreRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.submitMatchScore(matchId, request, currentUser);
    }
}
