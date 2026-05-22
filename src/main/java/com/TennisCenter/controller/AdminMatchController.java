package com.TennisCenter.controller;

import com.TennisCenter.dto.match.AssignUmpireRequest;
import com.TennisCenter.dto.match.ScheduleMatchRequest;
import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.match.TournamentMatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/{matchId}/schedule")
    public TournamentMatchResponse scheduleMatch(
            @PathVariable Long matchId,
            @RequestBody ScheduleMatchRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.scheduleMatch(matchId, request, currentUser);
    }

    @PutMapping("/{matchId}/umpire")
    public TournamentMatchResponse assignUmpire(
            @PathVariable Long matchId,
            @RequestBody AssignUmpireRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.assignUmpire(matchId, request.getUmpireId(), currentUser);
    }

    @DeleteMapping("/{matchId}/umpire")
    public TournamentMatchResponse removeUmpire(
            @PathVariable Long matchId,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.assignUmpire(matchId, null, currentUser);
    }
}
