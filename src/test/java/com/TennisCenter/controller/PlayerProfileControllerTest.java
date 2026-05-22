package com.TennisCenter.controller;

import com.TennisCenter.dto.profile.MatchHistoryResponse;
import com.TennisCenter.dto.profile.PlayerProfileResponse;
import com.TennisCenter.dto.profile.TitleFinalsResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.service.match.MatchHistoryService;
import com.TennisCenter.service.user.PlayerProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class PlayerProfileControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private PlayerProfileService playerProfileService;
    @MockitoBean private MatchHistoryService matchHistoryService;

    @Test
    void getProfile_shouldReturn200() throws Exception {
        PlayerProfileResponse resp = PlayerProfileResponse.builder()
                .userId(1L)
                .firstName("Alice")
                .lastName("Smith")
                .wins(10)
                .losses(3)
                .rankingPoints(1075)
                .build();
        when(playerProfileService.getProfile(1L)).thenReturn(resp);

        mockMvc.perform(get("/api/player/profile/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.wins").value(10));
    }

    @Test
    void getProfile_shouldReturn404WhenNotFound() throws Exception {
        when(playerProfileService.getProfile(99L))
                .thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(get("/api/player/profile/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getMatchHistory_shouldReturn200() throws Exception {
        MatchHistoryResponse match = MatchHistoryResponse.builder()
                .matchId(1L)
                .winnerName("Alice Smith")
                .loserName("Bob Jones")
                .profilePlayerWon(true)
                .build();
        when(matchHistoryService.getMatchHistory(1L)).thenReturn(List.of(match));

        mockMvc.perform(get("/api/player/profile/1/match-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].winnerName").value("Alice Smith"));
    }

    @Test
    void getTitlesAndFinals_shouldReturn200() throws Exception {
        TitleFinalsResponse title = TitleFinalsResponse.builder()
                .tournamentName("Spring Open")
                .won(true)
                .build();
        when(playerProfileService.getTitlesAndFinals(1L)).thenReturn(List.of(title));

        mockMvc.perform(get("/api/player/profile/1/titles-finals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tournamentName").value("Spring Open"));
    }

    @Test
    void updateProfile_shouldReturn200() throws Exception {
        PlayerProfileResponse resp = PlayerProfileResponse.builder()
                .userId(1L).bio("New bio").build();
        when(playerProfileService.updateProfile(eq(1L), any(), any())).thenReturn(resp);

        mockMvc.perform(put("/api/player/profile/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"bio\":\"New bio\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bio").value("New bio"));
    }
}