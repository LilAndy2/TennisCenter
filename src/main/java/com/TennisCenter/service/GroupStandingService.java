package com.TennisCenter.service;

import com.TennisCenter.dto.match.GroupStandingPlayerResponse;
import com.TennisCenter.dto.match.GroupStandingResponse;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class GroupStandingService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;

    public List<GroupStandingResponse> getGroupStandings(Long tournamentId) {
        List<TournamentMatch> groupMatches = tournamentMatchRepository
                .findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                        tournamentId,
                        TournamentMatchPhase.GROUP_STAGE
                );

        Map<String, Map<Long, GroupStandingAccumulator>> standingsByGroup = new LinkedHashMap<>();

        for (TournamentMatch match : groupMatches) {
            if (match.getGroupName() == null) continue;

            standingsByGroup.putIfAbsent(match.getGroupName(), new LinkedHashMap<>());
            Map<Long, GroupStandingAccumulator> groupMap = standingsByGroup.get(match.getGroupName());

            if (match.getPlayerOne() != null) {
                groupMap.putIfAbsent(match.getPlayerOne().getId(),
                        new GroupStandingAccumulator(match.getPlayerOne()));
            }
            if (match.getPlayerTwo() != null) {
                groupMap.putIfAbsent(match.getPlayerTwo().getId(),
                        new GroupStandingAccumulator(match.getPlayerTwo()));
            }

            if (match.getStatus() != TournamentMatchStatus.COMPLETED) continue;
            if (match.getPlayerOne() == null || match.getPlayerTwo() == null) continue;

            GroupStandingAccumulator playerOneStats = groupMap.get(match.getPlayerOne().getId());
            GroupStandingAccumulator playerTwoStats = groupMap.get(match.getPlayerTwo().getId());

            List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());

            int playerOneSetsWon = 0;
            int playerTwoSetsWon = 0;

            for (MatchSet set : sets) {
                playerOneStats.gamesWon += set.getPlayerOneGames();
                playerOneStats.gamesLost += set.getPlayerTwoGames();
                playerTwoStats.gamesWon += set.getPlayerTwoGames();
                playerTwoStats.gamesLost += set.getPlayerOneGames();

                if (set.getPlayerOneGames() > set.getPlayerTwoGames()) {
                    playerOneSetsWon++;
                } else if (set.getPlayerTwoGames() > set.getPlayerOneGames()) {
                    playerTwoSetsWon++;
                }
            }

            playerOneStats.setsWon += playerOneSetsWon;
            playerOneStats.setsLost += playerTwoSetsWon;
            playerTwoStats.setsWon += playerTwoSetsWon;
            playerTwoStats.setsLost += playerOneSetsWon;

            if (match.getWinner() != null) {
                if (match.getWinner().getId().equals(match.getPlayerOne().getId())) {
                    playerOneStats.wins++;
                    playerTwoStats.losses++;
                } else if (match.getWinner().getId().equals(match.getPlayerTwo().getId())) {
                    playerTwoStats.wins++;
                    playerOneStats.losses++;
                }
            }
        }

        List<GroupStandingResponse> result = new ArrayList<>();

        for (Map.Entry<String, Map<Long, GroupStandingAccumulator>> entry : standingsByGroup.entrySet()) {
            List<GroupStandingAccumulator> sortedPlayers = new ArrayList<>(entry.getValue().values());

            sortedPlayers.sort(
                    Comparator.comparingInt(GroupStandingAccumulator::getWins).reversed()
                            .thenComparingDouble(GroupStandingAccumulator::getSetsWinPercentage).reversed()
                            .thenComparingDouble(GroupStandingAccumulator::getGamesWinPercentage).reversed()
                            .thenComparing(acc -> acc.user.getLastName(), String.CASE_INSENSITIVE_ORDER)
            );

            List<GroupStandingPlayerResponse> players = new ArrayList<>();
            for (int i = 0; i < sortedPlayers.size(); i++) {
                GroupStandingAccumulator acc = sortedPlayers.get(i);
                players.add(GroupStandingPlayerResponse.builder()
                        .playerId(acc.user.getId())
                        .position(i + 1)
                        .playerName(acc.user.getFirstName() + " " + acc.user.getLastName())
                        .wins(acc.wins)
                        .losses(acc.losses)
                        .setsWinPercentage(roundOneDecimal(acc.getSetsWinPercentage()))
                        .gamesWinPercentage(roundOneDecimal(acc.getGamesWinPercentage()))
                        .build());
            }

            result.add(GroupStandingResponse.builder()
                    .groupName(entry.getKey())
                    .players(players)
                    .build());
        }

        return result;
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private static class GroupStandingAccumulator {
        private final User user;
        private int wins = 0;
        private int losses = 0;
        private int setsWon = 0;
        private int setsLost = 0;
        private int gamesWon = 0;
        private int gamesLost = 0;

        private GroupStandingAccumulator(User user) {
            this.user = user;
        }

        private int getWins() {
            return wins;
        }

        private double getSetsWinPercentage() {
            int total = setsWon + setsLost;
            return total == 0 ? 0.0 : ((double) setsWon / total) * 100.0;
        }

        private double getGamesWinPercentage() {
            int total = gamesWon + gamesLost;
            return total == 0 ? 0.0 : ((double) gamesWon / total) * 100.0;
        }
    }
}