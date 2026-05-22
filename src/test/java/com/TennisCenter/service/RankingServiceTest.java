package com.TennisCenter.service;

import com.TennisCenter.model.RankingPoint;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.RankingPointRepository;
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.service.ranking.RankingService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RankingServiceTest {

    @Mock private RankingPointRepository rankingPointRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private RankingService rankingService;

    private User winner;
    private User loser;
    private TournamentMatch match;

    @BeforeEach
    void setUp() {
        winner = TestDataFactory.player(1L, "winner", "winner@test.com");
        loser = TestDataFactory.player(2L, "loser", "loser@test.com");
        match = TestDataFactory.match(TestDataFactory.tournament(), winner, loser);
    }

    @Test
    void awardMatchPoints_shouldDeleteOldAndCreateNewPoints() {
        when(rankingPointRepository.sumActivePointsByUserId(any(), any())).thenReturn(100);
        when(rankingPointRepository.countWinsByUserId(any())).thenReturn(1);
        when(rankingPointRepository.countLossesByUserId(any())).thenReturn(0);

        rankingService.awardMatchPoints(match, winner, loser);

        verify(rankingPointRepository).deleteByMatchId(match.getId());

        ArgumentCaptor<RankingPoint> captor = ArgumentCaptor.forClass(RankingPoint.class);
        verify(rankingPointRepository, times(2)).save(captor.capture());

        List<RankingPoint> saved = captor.getAllValues();

        RankingPoint winPoint = saved.stream().filter(RankingPoint::isWin).findFirst().orElseThrow();
        assertThat(winPoint.getPoints()).isEqualTo(100);
        assertThat(winPoint.getUser()).isEqualTo(winner);
        assertThat(winPoint.getExpiryDate()).isEqualTo(LocalDate.now().plusYears(1));

        RankingPoint lossPoint = saved.stream().filter(rp -> !rp.isWin()).findFirst().orElseThrow();
        assertThat(lossPoint.getPoints()).isEqualTo(25);
        assertThat(lossPoint.getUser()).isEqualTo(loser);
    }

    @Test
    void syncUserStats_shouldUpdateUserFields() {
        when(rankingPointRepository.sumActivePointsByUserId(eq(1L), any())).thenReturn(250);
        when(rankingPointRepository.countWinsByUserId(1L)).thenReturn(3);
        when(rankingPointRepository.countLossesByUserId(1L)).thenReturn(1);

        rankingService.syncUserStats(winner);

        assertThat(winner.getRankingPoints()).isEqualTo(250);
        assertThat(winner.getWins()).isEqualTo(3);
        assertThat(winner.getLosses()).isEqualTo(1);
        verify(userRepository).save(winner);
    }

    @Test
    void getActivePoints_shouldDelegateToRepository() {
        when(rankingPointRepository.sumActivePointsByUserId(eq(1L), any())).thenReturn(500);

        int points = rankingService.getActivePoints(1L);

        assertThat(points).isEqualTo(500);
    }

    @Test
    void getWins_shouldDelegateToRepository() {
        when(rankingPointRepository.countWinsByUserId(1L)).thenReturn(7);

        assertThat(rankingService.getWins(1L)).isEqualTo(7);
    }

    @Test
    void getLosses_shouldDelegateToRepository() {
        when(rankingPointRepository.countLossesByUserId(1L)).thenReturn(3);

        assertThat(rankingService.getLosses(1L)).isEqualTo(3);
    }
}