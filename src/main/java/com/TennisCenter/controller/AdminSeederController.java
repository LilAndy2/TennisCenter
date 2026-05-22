package com.TennisCenter.controller;

import com.TennisCenter.service.match.MatchPointSeederService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminSeederController {

    private final MatchPointSeederService matchPointSeederService;

    /**
     * Seed all completed matches that don't have point-by-point data yet.
     * Generates realistic synthetic MatchPoint rows based on existing set scores.
     *
     * POST /api/admin/seed-match-points
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/seed-match-points")
    public ResponseEntity<Map<String, Object>> seedMatchPoints() {
        int seededCount = matchPointSeederService.seedAllCompletedMatches();
        return ResponseEntity.ok(Map.of(
                "message", "Match point seeding completed",
                "matchesSeeded", seededCount
        ));
    }
}