package com.TennisCenter.controller;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/schedule")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public List<ScheduledMatchResponse> getAllScheduledMatches() {
        return scheduleService.getAllScheduledMatches();
    }
}