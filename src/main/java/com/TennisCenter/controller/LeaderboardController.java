package com.TennisCenter.controller;

import com.TennisCenter.dto.leaderboard.LeaderboardPlayerResponse;
import com.TennisCenter.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player/leaderboard")
@RequiredArgsConstructor
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    public Page<LeaderboardPlayerResponse> getLeaderboard(
            @RequestParam String level,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return leaderboardService.getLeaderboard(level, search, page, size);
    }
}