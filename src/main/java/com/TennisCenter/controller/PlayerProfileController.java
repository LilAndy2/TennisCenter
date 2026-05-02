package com.TennisCenter.controller;

import com.TennisCenter.dto.profile.MatchHistoryResponse;
import com.TennisCenter.dto.profile.PlayerProfileResponse;
import com.TennisCenter.dto.profile.UpdateProfileRequest;
import com.TennisCenter.model.User;
import com.TennisCenter.service.PlayerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/player/profile")
@RequiredArgsConstructor
public class PlayerProfileController {

    private final PlayerProfileService playerProfileService;

    @GetMapping("/{userId}")
    public PlayerProfileResponse getProfile(@PathVariable Long userId) {
        return playerProfileService.getProfile(userId);
    }

    @GetMapping("/me")
    public PlayerProfileResponse getMyProfile(@AuthenticationPrincipal User currentUser) {
        return playerProfileService.getProfile(currentUser.getId());
    }

    @GetMapping("/{userId}/match-history")
    public List<MatchHistoryResponse> getMatchHistory(@PathVariable Long userId) {
        return playerProfileService.getMatchHistory(userId);
    }

    @PutMapping("/{userId}")
    public PlayerProfileResponse updateProfile(
            @PathVariable Long userId,
            @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return playerProfileService.updateProfile(userId, request, currentUser);
    }

    @PostMapping("/{userId}/profile-image")
    public PlayerProfileResponse uploadProfileImage(
            @PathVariable Long userId,
            @RequestParam("image") MultipartFile image,
            @AuthenticationPrincipal User currentUser
    ) {
        return playerProfileService.uploadProfileImage(userId, image, currentUser);
    }
}
