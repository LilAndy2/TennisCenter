package com.TennisCenter.service;

import com.TennisCenter.dto.match.MatchSetScoreRequest;
import com.TennisCenter.dto.match.ScheduleMatchRequest;
import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.*;
import com.TennisCenter.repository.CourtRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.service.match.TournamentMatchMapper;
import com.TennisCenter.service.match.TournamentMatchService;
import com.TennisCenter.util.TestDataFactory;
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
class TournamentMatchServiceTest {

    @Mock private TournamentMatchRepository tournamentMatchRepository;
    @Mock private CourtRepository courtRepository;
    @Mock private TournamentMatchMapper tournamentMatchMapper;

    @InjectMocks private TournamentMatchService tournamentMatchService;

    @Test
    void getTournamentMatches_shouldReturnMappedResponses() {
        User admin = TestDataFactory.admin();
        Tournament tournament = TestDataFactory.tournament();
        TournamentMatch match = TestDataFactory.match(tournament,
                TestDataFactory.player(), TestDataFactory.player(2L, "bob", "bob@test.com"));

        TournamentMatchResponse response = TournamentMatchResponse.builder()
                .id(1L).build();

        when(tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(1L))
                .thenReturn(List.of(match));
        when(tournamentMatchMapper.toResponse(any(), any())).thenReturn(response);

        List<TournamentMatchResponse> result =
                tournamentMatchService.getTournamentMatches(1L, admin);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void submitMatchScore_shouldThrowWhenNotAdmin() {
        User player = TestDataFactory.player();
        SubmitMatchScoreRequest request = new SubmitMatchScoreRequest();

        assertThatThrownBy(() ->
                tournamentMatchService.submitMatchScore(1L, request, player))
                .isInstanceOf(UnauthorizedActionException.class);
    }

    @Test
    void submitMatchScore_shouldThrowWhenNoSets() {
        User admin = TestDataFactory.admin();
        TournamentMatch match = TestDataFactory.match(
                TestDataFactory.tournament(),
                TestDataFactory.player(),
                TestDataFactory.player(2L, "bob", "bob@test.com"));

        SubmitMatchScoreRequest request = new SubmitMatchScoreRequest();
        request.setSets(List.of());

        when(tournamentMatchRepository.findById(1L)).thenReturn(Optional.of(match));

        assertThatThrownBy(() ->
                tournamentMatchService.submitMatchScore(1L, request, admin))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("At least one set");
    }

    @Test
    void submitMatchScore_shouldThrowWhenMoreThan3Sets() {
        User admin = TestDataFactory.admin();
        TournamentMatch match = TestDataFactory.match(
                TestDataFactory.tournament(),
                TestDataFactory.player(),
                TestDataFactory.player(2L, "bob", "bob@test.com"));

        SubmitMatchScoreRequest request = new SubmitMatchScoreRequest();
        request.setSets(List.of(
                new MatchSetScoreRequest(), new MatchSetScoreRequest(),
                new MatchSetScoreRequest(), new MatchSetScoreRequest()
        ));

        when(tournamentMatchRepository.findById(1L)).thenReturn(Optional.of(match));

        assertThatThrownBy(() ->
                tournamentMatchService.submitMatchScore(1L, request, admin))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Maximum 3 sets");
    }

    @Test
    void submitMatchScore_shouldThrowWhenMatchNotFound() {
        User admin = TestDataFactory.admin();
        SubmitMatchScoreRequest request = new SubmitMatchScoreRequest();
        request.setSets(List.of(new MatchSetScoreRequest()));

        when(tournamentMatchRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                tournamentMatchService.submitMatchScore(99L, request, admin))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void scheduleMatch_shouldThrowWhenNotAdmin() {
        User player = TestDataFactory.player();
        ScheduleMatchRequest request = new ScheduleMatchRequest();

        assertThatThrownBy(() ->
                tournamentMatchService.scheduleMatch(1L, request, player))
                .isInstanceOf(UnauthorizedActionException.class);
    }

    @Test
    void scheduleMatch_shouldThrowWhenCourtNotFound() {
        User admin = TestDataFactory.admin();
        TournamentMatch match = TestDataFactory.match(
                TestDataFactory.tournament(),
                TestDataFactory.player(),
                TestDataFactory.player(2L, "bob", "bob@test.com"));

        ScheduleMatchRequest request = new ScheduleMatchRequest();
        request.setCourtId(99L);
        request.setScheduledTime("2025-06-01T14:00:00");

        when(tournamentMatchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(courtRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                tournamentMatchService.scheduleMatch(1L, request, admin))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Court not found");
    }

    @Test
    void scheduleMatch_shouldSetCourtAndTime() {
        User admin = TestDataFactory.admin();
        Tournament tournament = TestDataFactory.tournament();
        TournamentMatch match = TestDataFactory.match(tournament,
                TestDataFactory.player(),
                TestDataFactory.player(2L, "bob", "bob@test.com"));

        Location location = TestDataFactory.location();
        Court court = TestDataFactory.court(location);

        ScheduleMatchRequest request = new ScheduleMatchRequest();
        request.setCourtId(1L);
        request.setScheduledTime("2025-06-01T14:00:00");

        TournamentMatchResponse response = TournamentMatchResponse.builder()
                .id(1L).build();

        when(tournamentMatchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(courtRepository.findById(1L)).thenReturn(Optional.of(court));
        when(tournamentMatchRepository.save(any())).thenReturn(match);
        when(tournamentMatchMapper.toResponse(any(), any())).thenReturn(response);

        TournamentMatchResponse result =
                tournamentMatchService.scheduleMatch(1L, request, admin);

        assertThat(result).isNotNull();
        verify(tournamentMatchRepository).save(any());
    }
}