package com.TennisCenter.controller;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.UmpireService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/umpire")
@RequiredArgsConstructor
public class UmpireController {

    private final UmpireService umpireService;

    @GetMapping("/my-matches")
    public List<ScheduledMatchResponse> getMyMatches(@AuthenticationPrincipal User currentUser) {
        return umpireService.getMatchesForUmpire(currentUser.getId());
    }
}