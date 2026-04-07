package com.TennisCenter.service;

import com.TennisCenter.dto.match.MatchSetResponse;
import com.TennisCenter.dto.match.MatchSetScoreRequest;
import com.TennisCenter.dto.match.ScheduleMatchRequest;
import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.CourtRepository;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentMatchService {

    private final TournamentMatchRepository tournamentMatchRepository;
    private final MatchSetRepository matchSetRepository;
    private final CourtRepository courtRepository;

    public List<TournamentMatchResponse> getTournamentMatches(Long tournamentId, User currentUser) {
        return tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream()
                .map(match -> mapToResponse(match, currentUser))
                .toList();
    }

    @Transactional
    public TournamentMatchResponse submitMatchScore(
            Long matchId,
            SubmitMatchScoreRequest request,
            User currentUser) {

        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can submit match scores");
        }

        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (request == null || request.getSets() == null || request.getSets().isEmpty()) {
            throw new ValidationException("At least one set is required");
        }
        if (request.getSets().size() > 3) {
            throw new ValidationException("Maximum 3 sets are allowed");
        }
        if (match.getPlayerOne() == null || match.getPlayerTwo() == null) {
            throw new ValidationException("Cannot submit score for a match without two players");
        }

        int playerOneSetsWon = 0;
        int playerTwoSetsWon = 0;

        for (MatchSetScoreRequest setRequest : request.getSets()) {
            validateSetScore(setRequest);
            if (setRequest.getPlayerOneGames() > setRequest.getPlayerTwoGames()) {
                playerOneSetsWon++;
            } else if (setRequest.getPlayerTwoGames() > setRequest.getPlayerOneGames()) {
                playerTwoSetsWon++;
            }
        }

        User winner;
        if (playerOneSetsWon > playerTwoSetsWon) {
            winner = match.getPlayerOne();
        } else if (playerTwoSetsWon > playerOneSetsWon) {
            winner = match.getPlayerTwo();
        } else {
            throw new ValidationException("Sets cannot end in a tie");
        }

        matchSetRepository.deleteByMatchId(matchId);

        for (MatchSetScoreRequest setRequest : request.getSets()) {
            MatchSet set = MatchSet.builder()
                    .match(match)
                    .setNumber(setRequest.getSetNumber())
                    .playerOneGames(setRequest.getPlayerOneGames())
                    .playerTwoGames(setRequest.getPlayerTwoGames())
                    .playerOneTiebreakPoints(setRequest.getPlayerOneTiebreakPoints())
                    .playerTwoTiebreakPoints(setRequest.getPlayerTwoTiebreakPoints())
                    .build();

            matchSetRepository.save(set);
        }

        match.setWinner(winner);
        match.setStatus(TournamentMatchStatus.COMPLETED);
        match.setReportedBy(currentUser);
        TournamentMatch saved = tournamentMatchRepository.save(match);
        advanceWinnerToNextRound(match, winner);

        return mapToResponse(saved, currentUser);
    }

    @Transactional
    public TournamentMatchResponse scheduleMatch(
            Long matchId,
            ScheduleMatchRequest request,
            User currentUser) {

        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can schedule matches");
        }

        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));

        match.setScheduledTime(LocalDateTime.parse(request.getScheduledTime()));
        match.setCourt(court);

        TournamentMatch saved = tournamentMatchRepository.save(match);
        return mapToResponse(saved, currentUser);
    }

    public TournamentMatchResponse mapToResponse(TournamentMatch match, User currentUser) {
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

        boolean editableByCurrentUser = false;
        if (currentUser != null) {
            if (currentUser.getRole() == Role.ADMIN) {
                editableByCurrentUser = true;
            } else if (currentUser.getRole() == Role.PLAYER) {
                editableByCurrentUser =
                        (match.getPlayerOne() != null &&
                                match.getPlayerOne().getId().equals(currentUser.getId())) ||
                                (match.getPlayerTwo() != null &&
                                        match.getPlayerTwo().getId().equals(currentUser.getId()));
            }
        }

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

    private void validateSetScore(MatchSetScoreRequest setRequest) {
        if (setRequest.getSetNumber() == null || setRequest.getSetNumber() < 1) {
            throw new ValidationException("Set number must be at least 1");
        }
        if (setRequest.getPlayerOneGames() == null || setRequest.getPlayerTwoGames() == null) {
            throw new ValidationException("Set scores are required");
        }

        int playerOneGames = setRequest.getPlayerOneGames();
        int playerTwoGames = setRequest.getPlayerTwoGames();

        if (playerOneGames < 0 || playerTwoGames < 0) {
            throw new ValidationException("Games cannot be negative");
        }
        if (playerOneGames == playerTwoGames) {
            throw new ValidationException("A set cannot end in a draw");
        }

        int winnerGames = Math.max(playerOneGames, playerTwoGames);
        int loserGames = Math.min(playerOneGames, playerTwoGames);
        boolean isTiebreakSet = winnerGames == 7 && loserGames == 6;

        Integer playerOneTiebreak = setRequest.getPlayerOneTiebreakPoints();
        Integer playerTwoTiebreak = setRequest.getPlayerTwoTiebreakPoints();

        if ((playerOneTiebreak == null) != (playerTwoTiebreak == null)) {
            throw new ValidationException("Both tie-break values must be provided");
        }

        if (winnerGames == 6) {
            if (loserGames > 4) {
                throw new ValidationException("Invalid set score. Allowed scores include 6-0 to 6-4");
            }
            if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                throw new ValidationException("Tie-break points are allowed only for 7-6 sets");
            }
            return;
        }

        if (winnerGames == 7) {
            if (loserGames == 5) {
                if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                    throw new ValidationException("Tie-break points are allowed only for 7-6 sets");
                }
                return;
            }

            if (!isTiebreakSet) {
                throw new ValidationException("Invalid set score. Allowed scores include 7-5 and 7-6");
            }
            if (playerOneTiebreak == null || playerTwoTiebreak == null) {
                throw new ValidationException("Tie-break points are required for 7-6 sets");
            }
            if (playerOneTiebreak < 0 || playerTwoTiebreak < 0) {
                throw new ValidationException("Tie-break points cannot be negative");
            }

            boolean playerOneWonSet = playerOneGames > playerTwoGames;
            int winnerTiebreak = playerOneWonSet ? playerOneTiebreak : playerTwoTiebreak;
            int loserTiebreak = playerOneWonSet ? playerTwoTiebreak : playerOneTiebreak;

            if (winnerTiebreak < 7 || winnerTiebreak - loserTiebreak < 2) {
                throw new ValidationException(
                        "Invalid tie-break score. Winner must have at least 7 points and 2-point difference");
            }
            return;
        }

        throw new ValidationException("Invalid set score. Allowed winner game values are 6 or 7");
    }

    private void advanceWinnerToNextRound(TournamentMatch completedMatch, User winner) {
        if (completedMatch.getPhase() != TournamentMatchPhase.KNOCKOUT) return;

        int nextRound = completedMatch.getRoundNumber() + 1;
        Long tournamentId = completedMatch.getTournament().getId();

        // Find all matches in the next round
        List<TournamentMatch> nextRoundMatches = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream()
                .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT
                        && m.getRoundNumber() == nextRound)
                .sorted(Comparator.comparingInt(m -> m.getMatchOrder() == null ? 0 : m.getMatchOrder()))
                .toList();

        if (nextRoundMatches.isEmpty()) return;

        // Figure out which slot this winner goes into.
        // Match order in current round determines position in next round:
        // matches 1&2 → next round match 1, matches 3&4 → next round match 2, etc.
        int currentMatchOrder = completedMatch.getMatchOrder() == null ? 1 : completedMatch.getMatchOrder();
        int nextMatchIndex = (currentMatchOrder - 1) / 2; // 0-based index into next round

        if (nextMatchIndex >= nextRoundMatches.size()) return;

        TournamentMatch nextMatch = nextRoundMatches.get(nextMatchIndex);

        // Slot into playerOne or playerTwo based on whether current match order is odd or even
        if (currentMatchOrder % 2 == 1) {
            nextMatch.setPlayerOne(winner);
        } else {
            nextMatch.setPlayerTwo(winner);
        }

        // If both players are now set, the match is ready to play (already SCHEDULED)
        tournamentMatchRepository.save(nextMatch);
    }
}