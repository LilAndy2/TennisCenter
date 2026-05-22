package com.TennisCenter.service;

import com.TennisCenter.dto.profile.PlayerProfileResponse;
import com.TennisCenter.dto.profile.UpdateProfileRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.PlayerProfileRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.service.ranking.RankingService;
import com.TennisCenter.service.user.PlayerProfileService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerProfileServiceTest {

    @Mock private PlayerProfileRepository playerProfileRepository;
    @Mock private UserRepository userRepository;
    @Mock private TournamentMatchRepository tournamentMatchRepository;
    @Mock private RankingService rankingService;

    @InjectMocks private PlayerProfileService playerProfileService;

    @Test
    void getProfile_shouldReturnProfileWithStats() {
        User user = TestDataFactory.player();
        user.setPlayerLevel(PlayerLevel.MEDIUM);

        PlayerProfile profile = TestDataFactory.playerProfile(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(playerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(rankingService.getWins(1L)).thenReturn(10);
        when(rankingService.getLosses(1L)).thenReturn(3);
        when(rankingService.getActivePoints(1L)).thenReturn(1075);
        when(userRepository.searchLeaderboardPlayers(any(), any(), anyString(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        PlayerProfileResponse result = playerProfileService.getProfile(1L);

        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getWins()).isEqualTo(10);
        assertThat(result.getLosses()).isEqualTo(3);
        assertThat(result.getRankingPoints()).isEqualTo(1075);
    }

    @Test
    void getProfile_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> playerProfileService.getProfile(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("User not found");
    }

    @Test
    void getProfile_shouldCreateDefaultProfileIfMissing() {
        User user = TestDataFactory.player();
        user.setPlayerLevel(PlayerLevel.MEDIUM);

        PlayerProfile defaultProfile = PlayerProfile.builder()
                .user(user).titlesCount(0).finalsCount(0).build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(playerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(playerProfileRepository.save(any())).thenReturn(defaultProfile);
        when(rankingService.getWins(1L)).thenReturn(0);
        when(rankingService.getLosses(1L)).thenReturn(0);
        when(rankingService.getActivePoints(1L)).thenReturn(0);
        when(userRepository.searchLeaderboardPlayers(any(), any(), anyString(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        PlayerProfileResponse result = playerProfileService.getProfile(1L);

        assertThat(result.getTitlesCount()).isEqualTo(0);
        verify(playerProfileRepository).save(any());
    }

    @Test
    void getProfile_shouldCalculateWinRate() {
        User user = TestDataFactory.player();
        user.setPlayerLevel(PlayerLevel.MEDIUM);
        PlayerProfile profile = TestDataFactory.playerProfile(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(playerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(rankingService.getWins(1L)).thenReturn(7);
        when(rankingService.getLosses(1L)).thenReturn(3);
        when(rankingService.getActivePoints(1L)).thenReturn(775);
        when(userRepository.searchLeaderboardPlayers(any(), any(), anyString(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        PlayerProfileResponse result = playerProfileService.getProfile(1L);

        assertThat(result.getWinRate()).isEqualTo(70.0);
    }

    @Test
    void updateProfile_shouldThrowWhenNotOwnProfile() {
        User currentUser = TestDataFactory.player();
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("New bio");

        assertThatThrownBy(() ->
                playerProfileService.updateProfile(99L, request, currentUser))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("only update your own profile");
    }

    @Test
    void updateProfile_shouldUpdateBio() {
        User user = TestDataFactory.player();
        PlayerProfile profile = TestDataFactory.playerProfile(user);

        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("Updated bio");

        when(playerProfileRepository.findByUserId(1L)).thenReturn(Optional.of(profile));
        when(playerProfileRepository.save(any())).thenReturn(profile);
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(rankingService.getWins(1L)).thenReturn(0);
        when(rankingService.getLosses(1L)).thenReturn(0);
        when(rankingService.getActivePoints(1L)).thenReturn(0);
        when(userRepository.searchLeaderboardPlayers(any(), any(), anyString(), any()))
                .thenReturn(new PageImpl<>(List.of(user)));

        PlayerProfileResponse result = playerProfileService.updateProfile(1L, request, user);

        verify(playerProfileRepository).save(any());
    }
}