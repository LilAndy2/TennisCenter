package com.TennisCenter.service;

import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.TournamentRegistration;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.tournament.TournamentStatusService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentRegistrationServiceTest {

    @Mock private TournamentRegistrationRepository registrationRepository;
    @Mock private TournamentRepository tournamentRepository;
    @Mock private TournamentStatusService tournamentStatusService;

    @InjectMocks private TournamentRegistrationService registrationService;

    private User player;
    private Tournament tournament;

    @BeforeEach
    void setUp() {
        player = TestDataFactory.player();
        tournament = TestDataFactory.tournament();
        tournament.setStatus(TournamentStatus.UPCOMING);
    }

    @Test
    void register_shouldThrowWhenUserIsNotPlayer() {
        User admin = TestDataFactory.admin();
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        assertThatThrownBy(() -> registrationService.registerToTournament(1L, admin))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("Only players");
    }

    @Test
    void register_shouldThrowWhenTournamentNotUpcoming() {
        tournament.setStatus(TournamentStatus.ONGOING);
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        assertThatThrownBy(() -> registrationService.registerToTournament(1L, player))
                .isInstanceOf(UnauthorizedActionException.class);
    }

    @Test
    void register_shouldThrowWhenPlayerLevelTooHigh() {
        player.setPlayerLevel(PlayerLevel.EXPERT);
        tournament.setLevel(TournamentLevel.MEDIUM);
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        assertThatThrownBy(() -> registrationService.registerToTournament(1L, player))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("level");
    }

    @Test
    void removeParticipantByAdmin_shouldDeleteRegistration() {
        TournamentRegistration reg = TestDataFactory.registration(player, tournament);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(registrationRepository.findByPlayerIdAndTournamentId(1L, 1L))
                .thenReturn(Optional.of(reg));

        registrationService.removeParticipantByAdmin(1L, 1L);

        verify(registrationRepository).delete(reg);
    }
}