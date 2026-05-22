package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.tournament.TournamentMapper;
import com.TennisCenter.service.tournament.TournamentService;
import com.TennisCenter.service.tournament.TournamentStatusService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentServiceTest {

    @Mock private TournamentRepository tournamentRepository;
    @Mock private TournamentMapper tournamentMapper;
    @Mock private TournamentStatusService tournamentStatusService;

    @InjectMocks private TournamentService tournamentService;

    private User currentUser;
    private Tournament tournament;
    private TournamentResponse tournamentResponse;

    @BeforeEach
    void setUp() {
        currentUser = TestDataFactory.player();
        tournament = TestDataFactory.tournament();

        tournamentResponse = TournamentResponse.builder()
                .id(1L)
                .name("Spring Open")
                .build();
    }

    @Test
    void getAllTournaments_shouldReturnMappedTournaments() {
        when(tournamentRepository.findAllByOrderByStartDateAsc())
                .thenReturn(List.of(tournament));
        when(tournamentMapper.toResponse(tournament, currentUser))
                .thenReturn(tournamentResponse);

        List<TournamentResponse> result = tournamentService.getAllTournaments(currentUser);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Spring Open");
        verify(tournamentStatusService).syncWithDates(tournament);
        verify(tournamentRepository).saveAll(any());
    }

    @Test
    void getTournamentById_shouldReturnTournament() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(tournamentMapper.toResponse(tournament, currentUser))
                .thenReturn(tournamentResponse);

        TournamentResponse result = tournamentService.getTournamentById(1L, currentUser);

        assertThat(result.getId()).isEqualTo(1L);
        verify(tournamentStatusService).syncWithDates(tournament);
    }

    @Test
    void getTournamentById_shouldThrowWhenNotFound() {
        when(tournamentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tournamentService.getTournamentById(999L, currentUser))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteTournament_shouldDeleteExistingTournament() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        tournamentService.deleteTournament(1L);

        verify(tournamentRepository).delete(tournament);
    }

    @Test
    void deleteTournament_shouldThrowWhenNotFound() {
        when(tournamentRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> tournamentService.deleteTournament(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}