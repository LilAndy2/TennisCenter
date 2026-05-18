package com.TennisCenter.controller;

import com.TennisCenter.dto.tournament.TournamentParticipantResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.service.TournamentRegistrationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
class TournamentRegistrationControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TournamentRegistrationService tournamentRegistrationService;

    @Test
    void registerToTournament_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentRegistrationService.registerToTournament(eq(1L), any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/player/tournaments/1/register"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Spring Open"));
    }

    @Test
    void registerToTournament_shouldReturn400WhenLevelMismatch() throws Exception {
        when(tournamentRegistrationService.registerToTournament(eq(1L), any()))
                .thenThrow(new ValidationException("Your level does not meet requirements"));

        mockMvc.perform(post("/api/player/tournaments/1/register"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void withdrawFromTournament_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentRegistrationService.withdrawFromTournament(eq(1L), any()))
                .thenReturn(resp);

        mockMvc.perform(delete("/api/player/tournaments/1/register"))
                .andExpect(status().isOk());
    }

    @Test
    void getParticipants_shouldReturn200() throws Exception {
        TournamentParticipantResponse participant = TournamentParticipantResponse.builder()
                .id(1L)
                .fullName("Alice Smith")
                .build();
        when(tournamentRegistrationService.getParticipants(1L))
                .thenReturn(List.of(participant));

        mockMvc.perform(get("/api/player/tournaments/1/participants"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].fullName").value("Alice Smith"));
    }
}