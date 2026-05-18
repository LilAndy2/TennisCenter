package com.TennisCenter.controller;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.service.TournamentMatchService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AdminMatchControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TournamentMatchService tournamentMatchService;

    @Test
    void submitMatchScore_shouldReturn200() throws Exception {
        TournamentMatchResponse response = TournamentMatchResponse.builder()
                .id(1L).build();
        when(tournamentMatchService.submitMatchScore(eq(1L), any(), any()))
                .thenReturn(response);

        mockMvc.perform(put("/api/admin/matches/1/score")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sets\":[{\"setNumber\":1,\"playerOneGames\":6,\"playerTwoGames\":4}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void scheduleMatch_shouldReturn200() throws Exception {
        TournamentMatchResponse response = TournamentMatchResponse.builder()
                .id(1L).build();
        when(tournamentMatchService.scheduleMatch(eq(1L), any(), any()))
                .thenReturn(response);

        mockMvc.perform(put("/api/admin/matches/1/schedule")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courtId\":1,\"scheduledTime\":\"2025-06-01T14:00:00\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}