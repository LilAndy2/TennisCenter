package com.TennisCenter.service;

import com.TennisCenter.dto.match.GroupStandingResponse;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupStandingServiceTest {

    @Mock private TournamentMatchRepository matchRepository;

    @InjectMocks private GroupStandingService groupStandingService;

    @Test
    void getGroupStandings_shouldReturnEmptyWhenNoGroupMatches() {
        when(matchRepository.findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                eq(1L), eq(TournamentMatchPhase.GROUP_STAGE)))
                .thenReturn(Collections.emptyList());

        List<GroupStandingResponse> result = groupStandingService.getGroupStandings(1L);

        assertThat(result).isEmpty();
    }

    @Test
    void getGroupStandings_shouldGroupMatchesByGroupName() {
        User p1 = TestDataFactory.player(1L, "alice", "alice@test.com");
        User p2 = TestDataFactory.player(2L, "bob", "bob@test.com");
        Tournament tournament = TestDataFactory.tournament();

        TournamentMatch matchA = TestDataFactory.match(tournament, p1, p2);
        matchA.setPhase(TournamentMatchPhase.GROUP_STAGE);
        matchA.setGroupName("Group A");
        matchA.setStatus(TournamentMatchStatus.SCHEDULED);

        TournamentMatch matchB = TestDataFactory.match(tournament, p1, p2);
        matchB.setId(2L);
        matchB.setPhase(TournamentMatchPhase.GROUP_STAGE);
        matchB.setGroupName("Group B");
        matchB.setStatus(TournamentMatchStatus.SCHEDULED);

        when(matchRepository.findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                eq(1L), eq(TournamentMatchPhase.GROUP_STAGE)))
                .thenReturn(List.of(matchA, matchB));

        List<GroupStandingResponse> result = groupStandingService.getGroupStandings(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getGroupName()).isEqualTo("Group A");
        assertThat(result.get(1).getGroupName()).isEqualTo("Group B");
    }

    @Test
    void getGroupStandings_shouldSkipMatchesWithNullGroupName() {
        User p1 = TestDataFactory.player();
        User p2 = TestDataFactory.player(2L, "bob", "bob@test.com");
        Tournament tournament = TestDataFactory.tournament();

        TournamentMatch match = TestDataFactory.match(tournament, p1, p2);
        match.setPhase(TournamentMatchPhase.GROUP_STAGE);
        match.setGroupName(null);

        when(matchRepository.findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                eq(1L), eq(TournamentMatchPhase.GROUP_STAGE)))
                .thenReturn(List.of(match));

        List<GroupStandingResponse> result = groupStandingService.getGroupStandings(1L);

        assertThat(result).isEmpty();
    }
}