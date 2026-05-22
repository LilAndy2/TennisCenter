package com.TennisCenter.service;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.*;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.service.match.ScheduleService;
import com.TennisCenter.service.match.ScheduledMatchMapper;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock private TournamentMatchRepository matchRepository;
    @Mock private ScheduledMatchMapper scheduledMatchMapper;

    @InjectMocks private ScheduleService scheduleService;

    @Test
    void getAllScheduledMatches_shouldReturnOnlyScheduledMatches() {
        User p1 = TestDataFactory.player(1L, "alice", "alice@test.com");
        User p2 = TestDataFactory.player(2L, "bob", "bob@test.com");
        p2.setFirstName("Bob");
        p2.setLastName("Smith");
        Tournament tournament = TestDataFactory.tournament();

        TournamentMatch scheduled = TestDataFactory.match(tournament, p1, p2);
        scheduled.setScheduledTime(LocalDateTime.now().plusDays(1));

        TournamentMatch unscheduled = TestDataFactory.match(tournament, p1, p2);
        unscheduled.setId(2L);
        unscheduled.setScheduledTime(null);

        when(matchRepository.findAll()).thenReturn(List.of(scheduled, unscheduled));
        when(scheduledMatchMapper.toResponse(any())).thenAnswer(invocation -> {
            TournamentMatch m = invocation.getArgument(0);
            return ScheduledMatchResponse.builder()
                    .matchId(m.getId())
                    .scheduledTime(m.getScheduledTime() != null ? m.getScheduledTime().toString() : null)
                    .playerOneName(m.getPlayerOne() != null ? m.getPlayerOne().getFullName() : "TBD")
                    .playerTwoName(m.getPlayerTwo() != null ? m.getPlayerTwo().getFullName() : "TBD")
                    .tournamentName(m.getTournament().getName())
                    .build();
        });

        List<ScheduledMatchResponse> result = scheduleService.getAllScheduledMatches();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getPlayerOneName()).isEqualTo("John Doe");
        assertThat(result.get(0).getPlayerTwoName()).isEqualTo("Bob Smith");
        assertThat(result.get(0).getTournamentName()).isEqualTo("Spring Open");
    }

    @Test
    void getAllScheduledMatches_shouldSortByScheduledTime() {
        User p1 = TestDataFactory.player(1L, "alice", "alice@test.com");
        User p2 = TestDataFactory.player(2L, "bob", "bob@test.com");
        Tournament tournament = TestDataFactory.tournament();

        TournamentMatch later = TestDataFactory.match(tournament, p1, p2);
        later.setId(1L);
        later.setScheduledTime(LocalDateTime.now().plusDays(5));

        TournamentMatch earlier = TestDataFactory.match(tournament, p1, p2);
        earlier.setId(2L);
        earlier.setScheduledTime(LocalDateTime.now().plusDays(1));

        when(matchRepository.findAll()).thenReturn(List.of(later, earlier));
        when(scheduledMatchMapper.toResponse(any())).thenAnswer(invocation -> {
            TournamentMatch m = invocation.getArgument(0);
            return ScheduledMatchResponse.builder()
                    .matchId(m.getId())
                    .scheduledTime(m.getScheduledTime() != null ? m.getScheduledTime().toString() : null)
                    .playerOneName(m.getPlayerOne() != null ? m.getPlayerOne().getFullName() : "TBD")
                    .playerTwoName(m.getPlayerTwo() != null ? m.getPlayerTwo().getFullName() : "TBD")
                    .tournamentName(m.getTournament().getName())
                    .build();
        });

        List<ScheduledMatchResponse> result = scheduleService.getAllScheduledMatches();

        assertThat(result).hasSize(2);
        // Earlier match should come first
        assertThat(result.get(0).getMatchId()).isEqualTo(2L);
    }

    @Test
    void getAllScheduledMatches_shouldHandleTBDPlayers() {
        Tournament tournament = TestDataFactory.tournament();
        TournamentMatch match = TestDataFactory.match(tournament, null, null);
        match.setPlayerOne(null);
        match.setPlayerTwo(null);
        match.setScheduledTime(LocalDateTime.now().plusDays(1));

        when(matchRepository.findAll()).thenReturn(List.of(match));
        when(scheduledMatchMapper.toResponse(any())).thenAnswer(invocation -> {
            TournamentMatch m = invocation.getArgument(0);
            return ScheduledMatchResponse.builder()
                    .matchId(m.getId())
                    .scheduledTime(m.getScheduledTime() != null ? m.getScheduledTime().toString() : null)
                    .playerOneName(m.getPlayerOne() != null ? m.getPlayerOne().getFullName() : "TBD")
                    .playerTwoName(m.getPlayerTwo() != null ? m.getPlayerTwo().getFullName() : "TBD")
                    .tournamentName(m.getTournament().getName())
                    .build();
        });

        List<ScheduledMatchResponse> result = scheduleService.getAllScheduledMatches();

        assertThat(result.get(0).getPlayerOneName()).isEqualTo("TBD");
        assertThat(result.get(0).getPlayerTwoName()).isEqualTo("TBD");
    }
}