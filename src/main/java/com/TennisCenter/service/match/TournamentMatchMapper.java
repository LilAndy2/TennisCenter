package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.MatchSetResponse;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.repository.MatchSetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TournamentMatchMapper {

    private final MatchSetRepository matchSetRepository;

    public TournamentMatchResponse toResponse(TournamentMatch match, User currentUser) {
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

        boolean editableByCurrentUser = resolveEditable(match, currentUser);

        return TournamentMatchResponse.builder()
                .id(match.getId())
                .tournamentId(match.getTournament().getId())
                .phase(match.getPhase().name())
                .groupName(match.getGroupName())
                .roundNumber(match.getRoundNumber())
                .matchOrder(match.getMatchOrder())
                .status(match.getStatus().name())
                .matchDate(match.getMatchDate() != null ? match.getMatchDate().toString() : null)
                .playerOneId(match.getPlayerOne() != null ? match.getPlayerOne().getId() : null)
                .playerOneName(match.getPlayerOne() != null
                        ? match.getPlayerOne().getFirstName() + " " + match.getPlayerOne().getLastName()
                        : null)
                .playerTwoId(match.getPlayerTwo() != null ? match.getPlayerTwo().getId() : null)
                .playerTwoName(match.getPlayerTwo() != null
                        ? match.getPlayerTwo().getFirstName() + " " + match.getPlayerTwo().getLastName()
                        : null)
                .winnerId(match.getWinner() != null ? match.getWinner().getId() : null)
                .winnerName(match.getWinner() != null
                        ? match.getWinner().getFirstName() + " " + match.getWinner().getLastName()
                        : null)
                .sets(sets)
                .editableByCurrentUser(editableByCurrentUser)
                .scheduledTime(match.getScheduledTime() != null
                        ? match.getScheduledTime().toString() : null)
                .courtId(match.getCourt() != null ? match.getCourt().getId() : null)
                .courtNumber(match.getCourt() != null ? match.getCourt().getCourtNumber() : null)
                .locationName(match.getCourt() != null
                        ? match.getCourt().getLocation().getName() : null)
                .playerOneSeed(match.getPlayerOneSeed())
                .playerTwoSeed(match.getPlayerTwoSeed())
                .build();
    }

    private boolean resolveEditable(TournamentMatch match, User currentUser) {
        if (currentUser == null) return false;
        if (currentUser.getRole() == Role.ADMIN) return true;
        if (currentUser.getRole() == Role.PLAYER) {
            return (match.getPlayerOne() != null &&
                    match.getPlayerOne().getId().equals(currentUser.getId())) ||
                    (match.getPlayerTwo() != null &&
                            match.getPlayerTwo().getId().equals(currentUser.getId()));
        }
        return false;
    }
}