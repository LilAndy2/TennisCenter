package com.TennisCenter.service;

import com.TennisCenter.model.RankingPoint;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.RankingPointRepository;
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RankingPointExpiryTaskTest {

    @Mock private RankingPointRepository rankingPointRepository;
    @Mock private UserRepository userRepository;
    @Mock private RankingService rankingService;

    @InjectMocks private RankingPointExpiryTask expiryTask;

    @Test
    void syncExpiredPoints_shouldDoNothingWhenNoExpiredPoints() {
        when(rankingPointRepository.findByExpiryDateLessThanEqual(any()))
                .thenReturn(Collections.emptyList());

        expiryTask.syncExpiredPoints();

        verify(userRepository, never()).findById(any());
        verify(rankingService, never()).syncUserStats(any());
    }

    @Test
    void syncExpiredPoints_shouldSyncAffectedUsers() {
        User user1 = TestDataFactory.player(1L, "user1", "user1@test.com");
        User user2 = TestDataFactory.player(2L, "user2", "user2@test.com");

        var tournament = TestDataFactory.tournament();
        var match = TestDataFactory.match(tournament, user1, user2);

        RankingPoint rp1 = TestDataFactory.rankingPoint(user1, match, true);
        RankingPoint rp2 = TestDataFactory.rankingPoint(user2, match, false);

        when(rankingPointRepository.findByExpiryDateLessThanEqual(any()))
                .thenReturn(List.of(rp1, rp2));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user1));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user2));

        expiryTask.syncExpiredPoints();

        verify(rankingService).syncUserStats(user1);
        verify(rankingService).syncUserStats(user2);
    }

    @Test
    void syncExpiredPoints_shouldDeduplicateUsers() {
        User user = TestDataFactory.player();
        var tournament = TestDataFactory.tournament();
        var match1 = TestDataFactory.match(tournament, user, TestDataFactory.player(2L, "p2", "p2@test.com"));
        var match2 = TestDataFactory.match(tournament, user, TestDataFactory.player(3L, "p3", "p3@test.com"));

        RankingPoint rp1 = TestDataFactory.rankingPoint(user, match1, true);
        RankingPoint rp2 = TestDataFactory.rankingPoint(user, match2, true);

        when(rankingPointRepository.findByExpiryDateLessThanEqual(any()))
                .thenReturn(List.of(rp1, rp2));
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));

        expiryTask.syncExpiredPoints();

        // Should only sync once despite two expired points for same user
        verify(rankingService, times(1)).syncUserStats(user);
    }
}