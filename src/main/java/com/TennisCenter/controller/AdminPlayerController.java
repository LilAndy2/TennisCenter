package com.TennisCenter.controller;

import com.TennisCenter.dto.admin.AdminPlayerResponse;
import com.TennisCenter.dto.admin.ChangePlayerLevelRequest;
import com.TennisCenter.service.user.AdminPlayerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/players")
@RequiredArgsConstructor
public class AdminPlayerController {

    private final AdminPlayerService adminPlayerService;

    @GetMapping
    public List<AdminPlayerResponse> getPlayersByLevel(
            @RequestParam String level,
            @RequestParam(defaultValue = "") String search
    ) {
        return adminPlayerService.getPlayersByLevel(level, search);
    }

    @PutMapping("/{userId}/level")
    public AdminPlayerResponse changePlayerLevel(
            @PathVariable Long userId,
            @RequestBody ChangePlayerLevelRequest request
    ) {
        return adminPlayerService.changePlayerLevel(userId, request.getPlayerLevel());
    }

    @GetMapping("/umpires")
    public List<AdminPlayerResponse> getUmpires(
            @RequestParam(defaultValue = "") String search
    ) {
        return adminPlayerService.getUmpires(search);
    }

    @GetMapping("/search-for-umpire")
    public List<AdminPlayerResponse> searchPlayersForUmpire(
            @RequestParam(defaultValue = "") String search
    ) {
        return adminPlayerService.searchPlayersForUmpire(search);
    }

    @PostMapping("/{userId}/umpire-role")
    public AdminPlayerResponse addUmpireRole(@PathVariable Long userId) {
        return adminPlayerService.addUmpireRole(userId);
    }

    @DeleteMapping("/{userId}/umpire-role")
    public AdminPlayerResponse removeUmpireRole(@PathVariable Long userId) {
        return adminPlayerService.removeUmpireRole(userId);
    }
}