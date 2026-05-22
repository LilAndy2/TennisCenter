package com.TennisCenter.controller;

import com.TennisCenter.dto.match.MatchStatsResponse;
import com.TennisCenter.service.match.MatchStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchStatsController {

    private final MatchStatsService matchStatsService;

    @GetMapping("/{matchId}/stats")
    public MatchStatsResponse getMatchStats(@PathVariable Long matchId) {
        return matchStatsService.getMatchStats(matchId);
    }

    @GetMapping("/{matchId}/has-stats")
    public ResponseEntity<Map<String, Boolean>> hasStats(@PathVariable Long matchId) {
        boolean hasStats = matchStatsService.hasStats(matchId);
        return ResponseEntity.ok(Map.of("hasStats", hasStats));
    }
}