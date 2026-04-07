package com.TennisCenter.service;

import com.TennisCenter.dto.match.ScheduledMatchResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;

    public List<ScheduledMatchResponse> getAllScheduledMatches() {
        return tournamentMatchRepository.findAll()
                .stream()
                .filter(match -> match.getScheduledTime() != null)
                .map(this::toScheduledResponse)
                .sorted(Comparator.comparing(ScheduledMatchResponse::getScheduledTime))
                .toList();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private ScheduledMatchResponse toScheduledResponse(TournamentMatch match) {
        var sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId())
                .stream()
                .map(set -> com.TennisCenter.dto.match.MatchSetResponse.builder()
                        .setNumber(set.getSetNumber())
                        .playerOneGames(set.getPlayerOneGames())
                        .playerTwoGames(set.getPlayerTwoGames())
                        .playerOneTiebreakPoints(set.getPlayerOneTiebreakPoints())
                        .playerTwoTiebreakPoints(set.getPlayerTwoTiebreakPoints())
                        .build())
                .toList();

        return ScheduledMatchResponse.builder()
                .matchId(match.getId())
                .scheduledTime(match.getScheduledTime().toString())
                .matchDate(match.getScheduledTime().toLocalDate().toString())
                .playerOneName(match.getPlayerOne() != null
                        ? match.getPlayerOne().getFirstName() + " " + match.getPlayerOne().getLastName()
                        : "TBD")
                .playerTwoName(match.getPlayerTwo() != null
                        ? match.getPlayerTwo().getFirstName() + " " + match.getPlayerTwo().getLastName()
                        : "TBD")
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
                        ? match.getWinner().getFirstName() + " " + match.getWinner().getLastName()
                        : null)
                .sets(sets)
                .build();
    }
}