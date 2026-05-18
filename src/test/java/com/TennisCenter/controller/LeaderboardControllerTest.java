package com.TennisCenter.controller;

import com.TennisCenter.dto.leaderboard.LeaderboardPlayerResponse;
import com.TennisCenter.service.LeaderboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class LeaderboardControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private LeaderboardService leaderboardService;

    @Test
    void getLeaderboard_shouldReturn200() throws Exception {
        LeaderboardPlayerResponse player = LeaderboardPlayerResponse.builder()
                .id(1L)
                .rank(1)
                .fullName("Alice Smith")
                .level("Medium")
                .wins(10)
                .losses(3)
                .winRate(76.9)
                .points(1075)
                .build();

        when(leaderboardService.getLeaderboard(eq("MEDIUM"), eq(""), eq(0), eq(10)))
                .thenReturn(new PageImpl<>(List.of(player)));

        mockMvc.perform(get("/api/player/leaderboard")
                        .param("level", "MEDIUM")
                        .param("search", "")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Alice Smith"))
                .andExpect(jsonPath("$.content[0].rank").value(1))
                .andExpect(jsonPath("$.content[0].points").value(1075));
    }

    @Test
    void getLeaderboard_shouldReturnEmptyPage() throws Exception {
        when(leaderboardService.getLeaderboard(eq("HIGH"), anyString(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of()));

        mockMvc.perform(get("/api/player/leaderboard")
                        .param("level", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content").isEmpty());
    }

    @Test
    void getLeaderboard_shouldSupportSearch() throws Exception {
        LeaderboardPlayerResponse player = LeaderboardPlayerResponse.builder()
                .id(1L)
                .rank(1)
                .fullName("Alice Smith")
                .points(500)
                .build();

        when(leaderboardService.getLeaderboard(eq("MEDIUM"), eq("alice"), eq(0), eq(10)))
                .thenReturn(new PageImpl<>(List.of(player)));

        mockMvc.perform(get("/api/player/leaderboard")
                        .param("level", "MEDIUM")
                        .param("search", "alice")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].fullName").value("Alice Smith"));
    }
}