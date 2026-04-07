package com.TennisCenter.service;

import com.TennisCenter.dto.match.GroupStandingPlayerResponse;
import com.TennisCenter.dto.match.GroupStandingResponse;
import com.TennisCenter.model.MatchSet;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.service.standing.GroupStandingAccumulator;
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
                        tournamentId, TournamentMatchPhase.GROUP_STAGE);

        Map<String, Map<Long, GroupStandingAccumulator>> standingsByGroup = new LinkedHashMap<>();

        for (TournamentMatch match : groupMatches) {
            if (match.getGroupName() == null) continue;

            standingsByGroup.putIfAbsent(match.getGroupName(), new LinkedHashMap<>());
            Map<Long, GroupStandingAccumulator> groupMap =
                    standingsByGroup.get(match.getGroupName());

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

            accumulateMatchStats(match, groupMap);
        }

        return buildResponse(standingsByGroup);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private void accumulateMatchStats(
            TournamentMatch match,
            Map<Long, GroupStandingAccumulator> groupMap) {

        GroupStandingAccumulator p1Stats = groupMap.get(match.getPlayerOne().getId());
        GroupStandingAccumulator p2Stats = groupMap.get(match.getPlayerTwo().getId());

        List<MatchSet> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId());

        int p1SetsWon = 0;
        int p2SetsWon = 0;

        for (MatchSet set : sets) {
            p1Stats.gamesWon  += set.getPlayerOneGames();
            p1Stats.gamesLost += set.getPlayerTwoGames();
            p2Stats.gamesWon  += set.getPlayerTwoGames();
            p2Stats.gamesLost += set.getPlayerOneGames();

            if (set.getPlayerOneGames() > set.getPlayerTwoGames()) {
                p1SetsWon++;
            } else if (set.getPlayerTwoGames() > set.getPlayerOneGames()) {
                p2SetsWon++;
            }
        }

        p1Stats.setsWon  += p1SetsWon;
        p1Stats.setsLost += p2SetsWon;
        p2Stats.setsWon  += p2SetsWon;
        p2Stats.setsLost += p1SetsWon;

        if (match.getWinner() != null) {
            if (match.getWinner().getId().equals(match.getPlayerOne().getId())) {
                p1Stats.wins++;
                p2Stats.losses++;
            } else if (match.getWinner().getId().equals(match.getPlayerTwo().getId())) {
                p2Stats.wins++;
                p1Stats.losses++;
            }
        }
    }

    private List<GroupStandingResponse> buildResponse(
            Map<String, Map<Long, GroupStandingAccumulator>> standingsByGroup) {

        List<GroupStandingResponse> result = new ArrayList<>();

        for (Map.Entry<String, Map<Long, GroupStandingAccumulator>> entry
                : standingsByGroup.entrySet()) {

            List<GroupStandingAccumulator> sorted = new ArrayList<>(entry.getValue().values());
            sorted.sort(
                    Comparator.comparingInt(GroupStandingAccumulator::getWins).reversed()
                            .thenComparing(Comparator.comparingDouble(
                                    GroupStandingAccumulator::getSetsWinPercentage).reversed())
                            .thenComparing(Comparator.comparingDouble(
                                    GroupStandingAccumulator::getGamesWinPercentage).reversed())
                            .thenComparing(acc -> acc.user.getLastName(),
                                    String.CASE_INSENSITIVE_ORDER)
            );

            List<GroupStandingPlayerResponse> players = new ArrayList<>();
            for (int i = 0; i < sorted.size(); i++) {
                GroupStandingAccumulator acc = sorted.get(i);
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
}