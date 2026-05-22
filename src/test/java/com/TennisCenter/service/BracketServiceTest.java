package com.TennisCenter.service;

import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.tournament.BracketService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BracketServiceTest {

    @Mock private TournamentRepository tournamentRepository;
    @Mock private TournamentMatchRepository matchRepository;
    @Mock private TournamentRegistrationRepository registrationRepository;

    @InjectMocks private BracketService bracketService;

    private User admin;
    private Tournament tournament;

    @BeforeEach
    void setUp() {
        admin = TestDataFactory.admin();
        tournament = TestDataFactory.tournament(1L, "Spring Open", TournamentStatus.ONGOING);
    }

    @Test
    void generateBracket_shouldThrowWhenNotAdmin() {
        User player = TestDataFactory.player();
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        assertThatThrownBy(() -> bracketService.generateBracket(1L, player))
                .isInstanceOf(UnauthorizedActionException.class)
                .hasMessageContaining("Only admins");
    }

    @Test
    void generateBracket_shouldThrowWhenTournamentNotOngoing() {
        tournament.setStatus(TournamentStatus.UPCOMING);
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));

        assertThatThrownBy(() -> bracketService.generateBracket(1L, admin))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("ongoing");
    }

    @Test
    void generateBracket_shouldThrowWhenAlreadyGenerated() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(matchRepository.findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(1L))
                .thenReturn(List.of(TestDataFactory.match(tournament, admin, admin)));

        assertThatThrownBy(() -> bracketService.generateBracket(1L, admin))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already generated");
    }

    @Test
    void generateBracket_shouldThrowWhenLessThanTwoParticipants() {
        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(matchRepository.findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(1L))
                .thenReturn(Collections.emptyList());
        when(registrationRepository.findByTournamentIdOrderByRegisteredAtAsc(1L))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> bracketService.generateBracket(1L, admin))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("at least 2");
    }
}