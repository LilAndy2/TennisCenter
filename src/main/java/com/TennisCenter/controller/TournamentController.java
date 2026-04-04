package com.TennisCenter.controller;

import com.TennisCenter.dto.match.GroupStandingResponse;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.service.ScheduleService;
import com.TennisCenter.service.GroupStandingService;
import com.TennisCenter.service.TournamentMatchService;
import com.TennisCenter.service.TournamentService;
import com.TennisCenter.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/tournaments")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;
    private final TournamentMatchService tournamentMatchService;
    private final GroupStandingService groupStandingService;
    private final ScheduleService scheduleService;

    @GetMapping
    public List<TournamentResponse> getAllTournaments(
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getAllTournaments(currentUser);
    }

    @GetMapping("/{id}")
    public TournamentResponse getTournamentById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentService.getTournamentById(id, currentUser);
    }

    @GetMapping("/{id}/matches")
    public List<TournamentMatchResponse> getTournamentMatches(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return tournamentMatchService.getTournamentMatches(id, currentUser);
    }

    @GetMapping("/{id}/group-standings")
    public List<GroupStandingResponse> getGroupStandings(
            @PathVariable Long id
    ) {
        return groupStandingService.getGroupStandings(id);
    }

    @GetMapping("/schedule")
    public List<ScheduledMatchResponse> getSchedule() {
        return scheduleService.getAllScheduledMatches();
    }
}
