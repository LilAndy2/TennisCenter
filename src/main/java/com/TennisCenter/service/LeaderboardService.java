package com.TennisCenter.service;

import com.TennisCenter.dto.leaderboard.LeaderboardPlayerResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    public Page<LeaderboardPlayerResponse> getLeaderboard(
            String level,
            String search,
            int page,
            int size
    ) {
        PlayerLevel playerLevel = PlayerLevel.valueOf(level.toUpperCase());

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("rankingPoints"),
                        Sort.Order.desc("wins"),
                        Sort.Order.asc("losses"),
                        Sort.Order.asc("lastName")
                )
        );

        Page<User> usersPage = userRepository.searchLeaderboardPlayers(
                Role.PLAYER,
                playerLevel,
                search == null ? "" : search.trim(),
                pageable
        );

        List<LeaderboardPlayerResponse> content = usersPage.getContent()
                .stream()
                .map(user -> mapToResponse(user, page, size, usersPage.getContent().indexOf(user)))
                .toList();

        return new PageImpl<>(content, pageable, usersPage.getTotalElements());
    }

    private LeaderboardPlayerResponse mapToResponse(
            User user,
            int page,
            int size,
            int indexInPage
    ) {
        int wins = user.getWins() == null ? 0 : user.getWins();
        int losses = user.getLosses() == null ? 0 : user.getLosses();
        int totalMatches = wins + losses;

        double winRate = totalMatches == 0
                ? 0.0
                : ((double) wins / totalMatches) * 100.0;

        int rank = page * size + indexInPage + 1;

        return LeaderboardPlayerResponse.builder()
                .id(user.getId())
                .rank(rank)
                .fullName(user.getFirstName() + " " + user.getLastName())
                .level(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : "-")
                .wins(wins)
                .losses(losses)
                .winRate(Math.round(winRate * 10.0) / 10.0)
                .points(user.getRankingPoints() == null ? 0 : user.getRankingPoints())
                .build();
    }
}