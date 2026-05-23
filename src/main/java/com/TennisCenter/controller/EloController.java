package com.TennisCenter.controller;

import com.TennisCenter.service.ranking.EloService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EloController {

    private final EloService eloService;

    /**
     * Global Elo leaderboard — all players across all levels, ranked by Elo.
     */
    @GetMapping("/player/elo-leaderboard")
    public Page<EloService.EloLeaderboardEntry> getEloLeaderboard(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return eloService.getEloLeaderboard(search, page, size);
    }

    /**
     * Admin endpoint: replay all completed matches chronologically
     * to rebuild Elo ratings from scratch.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/replay-elo")
    public ResponseEntity<Map<String, Object>> replayElo() {
        int count = eloService.replayAllMatches();
        return ResponseEntity.ok(Map.of(
                "message", "Elo ratings rebuilt from match history",
                "matchesReplayed", count
        ));
    }
}