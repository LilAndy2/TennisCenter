package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.MatchSetResponse;
import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.repository.MatchSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ScheduledMatchMapper {

    private final MatchSetRepository matchSetRepository;

    public ScheduledMatchResponse toResponse(TournamentMatch match) {
        List<MatchSetResponse> sets = matchSetRepository
                .findByMatchIdOrderBySetNumberAsc(match.getId())
                .stream()
                .map(set -> MatchSetResponse.builder()
                        .setNumber(set.getSetNumber())
                        .playerOneGames(set.getPlayerOneGames())
                        .playerTwoGames(set.getPlayerTwoGames())
                        .playerOneTiebreakPoints(set.getPlayerOneTiebreakPoints())
                        .playerTwoTiebreakPoints(set.getPlayerTwoTiebreakPoints())
                        .build())
                .toList();

        return ScheduledMatchResponse.builder()
                .matchId(match.getId())
                .scheduledTime(match.getScheduledTime() != null
                        ? match.getScheduledTime().toString() : null)
                .matchDate(match.getScheduledTime() != null
                        ? match.getScheduledTime().toLocalDate().toString()
                        : match.getMatchDate() != null
                        ? match.getMatchDate().toString() : null)
                .playerOneName(match.getPlayerOne() != null
                        ? match.getPlayerOne().getFullName() : "TBD")
                .playerTwoName(match.getPlayerTwo() != null
                        ? match.getPlayerTwo().getFullName() : "TBD")
                .tournamentName(match.getTournament().getName())
                .tournamentLevel(match.getTournament().getLevel().name())
                .courtId(match.getCourt() != null ? match.getCourt().getId() : null)
                .courtNumber(match.getCourt() != null ? match.getCourt().getCourtNumber() : null)
                .locationId(match.getCourt() != null
                        ? match.getCourt().getLocation().getId() : null)
                .locationName(match.getCourt() != null
                        ? match.getCourt().getLocation().getName() : null)
                .status(match.getStatus().name())
                .winnerName(match.getWinner() != null
                        ? match.getWinner().getFullName() : null)
                .sets(sets)
                .umpireId(match.getUmpire() != null ? match.getUmpire().getId() : null)
                .umpireName(match.getUmpire() != null
                        ? match.getUmpire().getFullName() : null)
                .build();
    }
}