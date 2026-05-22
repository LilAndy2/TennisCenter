package com.TennisCenter.controller;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.service.match.ScheduleService;
import com.TennisCenter.service.tournament.GroupStandingService;
import com.TennisCenter.service.tournament.TournamentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class TournamentControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TournamentService tournamentService;
    @MockitoBean private GroupStandingService groupStandingService;
    @MockitoBean private ScheduleService scheduleService;

    @Test
    void getAllTournaments_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentService.getAllTournaments(any())).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/player/tournaments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Spring Open"));
    }

    @Test
    void getSchedule_shouldReturn200() throws Exception {
        ScheduledMatchResponse resp = ScheduledMatchResponse.builder()
                .matchId(1L)
                .playerOneName("Alice")
                .playerTwoName("Bob")
                .tournamentName("Spring Open")
                .build();
        when(scheduleService.getAllScheduledMatches()).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/player/tournaments/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].playerOneName").value("Alice"));
    }

    @Test
    void getGroupStandings_shouldReturn200() throws Exception {
        when(groupStandingService.getGroupStandings(1L))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/player/tournaments/1/group-standings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}