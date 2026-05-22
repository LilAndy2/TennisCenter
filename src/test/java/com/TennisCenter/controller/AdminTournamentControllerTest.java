package com.TennisCenter.controller;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.service.tournament.BracketService;
import com.TennisCenter.service.tournament.TournamentRegistrationService;
import com.TennisCenter.service.tournament.TournamentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AdminTournamentControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private TournamentService tournamentService;
    @MockitoBean private TournamentRegistrationService tournamentRegistrationService;
    @MockitoBean private BracketService bracketService;

    @Test
    void getOngoingTournaments_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentService.getTournamentsByStatus(any(), any()))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/admin/tournaments/ongoing"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Spring Open"));
    }

    @Test
    void getUpcomingTournaments_shouldReturn200() throws Exception {
        when(tournamentService.getTournamentsByStatus(any(), any()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/admin/tournaments/upcoming"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void createTournament_shouldReturn200() throws Exception {
        CreateTournamentRequest request = new CreateTournamentRequest();
        request.setName("Summer Cup");

        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Summer Cup").build();
        when(tournamentService.createTournament(any(), any())).thenReturn(resp);

        mockMvc.perform(post("/api/admin/tournaments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Summer Cup\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Summer Cup"));
    }

    @Test
    void deleteTournament_shouldReturn200() throws Exception {
        doNothing().when(tournamentService).deleteTournament(1L);

        mockMvc.perform(delete("/api/admin/tournaments/1"))
                .andExpect(status().isOk());

        verify(tournamentService).deleteTournament(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void removeParticipant_shouldReturn200() throws Exception {
        doNothing().when(tournamentRegistrationService)
                .removeParticipantByAdmin(1L, 2L);

        mockMvc.perform(delete("/api/admin/tournaments/1/participants/2"))
                .andExpect(status().isOk());

        verify(tournamentRegistrationService).removeParticipantByAdmin(1L, 2L);
    }

    @Test
    void generateBracket_shouldReturn200() throws Exception {
        TournamentMatchResponse matchResp = TournamentMatchResponse.builder()
                .id(1L).build();
        when(bracketService.generateBracket(eq(1L), any()))
                .thenReturn(List.of(matchResp));

        mockMvc.perform(post("/api/admin/tournaments/1/generate-bracket"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void startTournament_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentService.startTournament(eq(1L), any())).thenReturn(resp);

        mockMvc.perform(post("/api/admin/tournaments/1/start"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void finishTournament_shouldReturn200() throws Exception {
        TournamentResponse resp = TournamentResponse.builder()
                .id(1L).name("Spring Open").build();
        when(tournamentService.finishTournament(eq(1L), any())).thenReturn(resp);

        mockMvc.perform(post("/api/admin/tournaments/1/finish"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }
}