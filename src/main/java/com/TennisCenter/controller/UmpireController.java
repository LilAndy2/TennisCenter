package com.TennisCenter.controller;

import com.TennisCenter.dto.match.LiveScoreResponse;
import com.TennisCenter.dto.match.RecordPointRequest;
import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.match.LiveScoringService;
import com.TennisCenter.service.match.MatchStatsService;
import com.TennisCenter.service.match.UmpireService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/umpire")
@RequiredArgsConstructor
public class UmpireController {

    private final UmpireService umpireService;
    private final LiveScoringService liveScoringService;
    private final MatchStatsService matchStatsService;

    @GetMapping("/my-matches")
    public List<ScheduledMatchResponse> getMyMatches(@AuthenticationPrincipal User currentUser) {
        return umpireService.getMatchesForUmpire(currentUser.getId());
    }

    /**
     * Get the current live score state for a match.
     */
    @GetMapping("/matches/{matchId}/live-score")
    public LiveScoreResponse getLiveScore(
            @PathVariable Long matchId,
            @AuthenticationPrincipal User currentUser
    ) {
        return liveScoringService.getLiveScore(matchId, currentUser);
    }

    /**
     * Record a single point during live scoring.
     */
    @PostMapping("/matches/{matchId}/points")
    public LiveScoreResponse recordPoint(
            @PathVariable Long matchId,
            @RequestBody RecordPointRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return liveScoringService.recordPoint(matchId, request, currentUser);
    }

    /**
     * Undo the last recorded point.
     */
    @DeleteMapping("/matches/{matchId}/points/last")
    public LiveScoreResponse undoLastPoint(
            @PathVariable Long matchId,
            @AuthenticationPrincipal User currentUser
    ) {
        return liveScoringService.undoLastPoint(matchId, currentUser);
    }

    /**
     * Set which player serves first (before scoring starts).
     */
    @PostMapping("/matches/{matchId}/first-server")
    public LiveScoreResponse setFirstServer(
            @PathVariable Long matchId,
            @RequestParam Long serverId,
            @AuthenticationPrincipal User currentUser
    ) {
        return liveScoringService.setFirstServer(matchId, serverId, currentUser);
    }
}