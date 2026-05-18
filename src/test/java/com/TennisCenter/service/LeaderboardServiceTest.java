package com.TennisCenter.service;

import com.TennisCenter.dto.leaderboard.LeaderboardPlayerResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaderboardServiceTest {

    @Mock private UserRepository userRepository;
    @InjectMocks private LeaderboardService leaderboardService;

    @Test
    void getLeaderboard_shouldReturnRankedPlayers() {
        User player1 = TestDataFactory.player(1L, "alice", "alice@test.com");
        player1.setRankingPoints(500);
        player1.setWins(5);
        player1.setLosses(2);

        User player2 = TestDataFactory.player(2L, "bob", "bob@test.com");
        player2.setFirstName("Bob");
        player2.setLastName("Smith");
        player2.setRankingPoints(300);
        player2.setWins(3);
        player2.setLosses(4);

        Page<User> page = new PageImpl<>(List.of(player1, player2), PageRequest.of(0, 10), 2);
        when(userRepository.searchLeaderboardPlayers(
                eq(Role.PLAYER), eq(PlayerLevel.MEDIUM), eq(""), any(Pageable.class)))
                .thenReturn(page);

        Page<LeaderboardPlayerResponse> result =
                leaderboardService.getLeaderboard("MEDIUM", "", 0, 10);

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getRank()).isEqualTo(1);
        assertThat(result.getContent().get(0).getPoints()).isEqualTo(500);
        assertThat(result.getContent().get(1).getRank()).isEqualTo(2);
    }

    @Test
    void getLeaderboard_shouldCalculateWinRateCorrectly() {
        User player = TestDataFactory.player();
        player.setWins(7);
        player.setLosses(3);

        Page<User> page = new PageImpl<>(List.of(player), PageRequest.of(0, 10), 1);
        when(userRepository.searchLeaderboardPlayers(any(), any(), any(), any()))
                .thenReturn(page);

        Page<LeaderboardPlayerResponse> result =
                leaderboardService.getLeaderboard("MEDIUM", "", 0, 10);

        assertThat(result.getContent().get(0).getWinRate()).isEqualTo(70.0);
    }

    @Test
    void getLeaderboard_shouldHandleZeroMatches() {
        User player = TestDataFactory.player();
        player.setWins(0);
        player.setLosses(0);

        Page<User> page = new PageImpl<>(List.of(player), PageRequest.of(0, 10), 1);
        when(userRepository.searchLeaderboardPlayers(any(), any(), any(), any()))
                .thenReturn(page);

        Page<LeaderboardPlayerResponse> result =
                leaderboardService.getLeaderboard("MEDIUM", "", 0, 10);

        assertThat(result.getContent().get(0).getWinRate()).isEqualTo(0.0);
    }

    @Test
    void getLeaderboard_shouldPaginateCorrectly() {
        User player = TestDataFactory.player();
        player.setRankingPoints(100);
        player.setWins(1);
        player.setLosses(0);

        Page<User> page = new PageImpl<>(List.of(player), PageRequest.of(2, 5), 11);
        when(userRepository.searchLeaderboardPlayers(any(), any(), any(), any()))
                .thenReturn(page);

        Page<LeaderboardPlayerResponse> result =
                leaderboardService.getLeaderboard("MEDIUM", "", 2, 5);

        // Page 2, size 5, first item on page → rank = 2*5 + 0 + 1 = 11
        assertThat(result.getContent().get(0).getRank()).isEqualTo(11);
    }
}