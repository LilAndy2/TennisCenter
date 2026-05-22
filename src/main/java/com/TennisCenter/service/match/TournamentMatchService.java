package com.TennisCenter.service.match;

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
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.service.ranking.RankingService;
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
    private final UserRepository userRepository;
    private final SetScoreValidator setScoreValidator;
    private final TournamentMatchMapper tournamentMatchMapper;
    private final RankingService rankingService;

    public List<TournamentMatchResponse> getTournamentMatches(Long tournamentId, User currentUser) {
        return tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream()
                .map(match -> tournamentMatchMapper.toResponse(match, currentUser))
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

        TournamentMatch match = findMatch(matchId);

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
            setScoreValidator.validate(setRequest);
            if (setRequest.getPlayerOneGames() > setRequest.getPlayerTwoGames()) {
                playerOneSetsWon++;
            } else if (setRequest.getPlayerTwoGames() > setRequest.getPlayerOneGames()) {
                playerTwoSetsWon++;
            }
        }

        User winner = resolveWinner(match, playerOneSetsWon, playerTwoSetsWon);
        User loser = winner.getId().equals(match.getPlayerOne().getId())
                ? match.getPlayerTwo()
                : match.getPlayerOne();

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
        match.setCompletedAt(LocalDateTime.now());
        match.setReportedBy(currentUser);
        TournamentMatch saved = tournamentMatchRepository.save(match);

        rankingService.awardMatchPoints(saved, winner, loser);

        advanceWinnerToNextRound(match, winner);

        return tournamentMatchMapper.toResponse(saved, currentUser);
    }

    @Transactional
    public TournamentMatchResponse scheduleMatch(
            Long matchId,
            ScheduleMatchRequest request,
            User currentUser) {

        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can schedule matches");
        }

        TournamentMatch match = findMatch(matchId);

        Court court = courtRepository.findById(request.getCourtId())
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));

        match.setScheduledTime(LocalDateTime.parse(request.getScheduledTime()));
        match.setCourt(court);

        TournamentMatch saved = tournamentMatchRepository.save(match);
        return tournamentMatchMapper.toResponse(saved, currentUser);
    }

    private TournamentMatch findMatch(Long matchId) {
        return tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));
    }

    private User resolveWinner(TournamentMatch match, int playerOneSetsWon, int playerTwoSetsWon) {
        if (playerOneSetsWon > playerTwoSetsWon) return match.getPlayerOne();
        if (playerTwoSetsWon > playerOneSetsWon) return match.getPlayerTwo();
        throw new ValidationException("Sets cannot end in a tie");
    }

    private void advanceWinnerToNextRound(TournamentMatch completedMatch, User winner) {
        if (completedMatch.getPhase() != TournamentMatchPhase.KNOCKOUT) return;

        int nextRound    = completedMatch.getRoundNumber() + 1;
        Long tournamentId = completedMatch.getTournament().getId();

        List<TournamentMatch> nextRoundMatches = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream()
                .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT
                        && m.getRoundNumber() == nextRound)
                .sorted(Comparator.comparingInt(m -> m.getMatchOrder() == null ? 0 : m.getMatchOrder()))
                .toList();

        if (nextRoundMatches.isEmpty()) return;

        int currentMatchOrder = completedMatch.getMatchOrder() == null
                ? 1 : completedMatch.getMatchOrder();
        int nextMatchIndex = (currentMatchOrder - 1) / 2;

        if (nextMatchIndex >= nextRoundMatches.size()) return;

        TournamentMatch nextMatch = nextRoundMatches.get(nextMatchIndex);
        if (currentMatchOrder % 2 == 1) {
            nextMatch.setPlayerOne(winner);
        } else {
            nextMatch.setPlayerTwo(winner);
        }
        tournamentMatchRepository.save(nextMatch);
    }

    @Transactional
    public TournamentMatchResponse assignUmpire(
            Long matchId,
            Long umpireId,
            User currentUser) {

        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can assign umpires");
        }

        TournamentMatch match = findMatch(matchId);

        if (umpireId == null) {
            match.setUmpire(null);
        } else {
            User umpire = userRepository.findById(umpireId)
                    .orElseThrow(() -> new ResourceNotFoundException("Umpire not found"));

            if (!umpire.getRoles().contains(Role.UMPIRE)) {
                throw new ValidationException("The selected user is not an umpire");
            }

            match.setUmpire(umpire);
        }

        TournamentMatch saved = tournamentMatchRepository.save(match);
        return tournamentMatchMapper.toResponse(saved, currentUser);
    }

    @Transactional
    public TournamentMatchResponse playerSubmitMatchScore(
            Long matchId,
            SubmitMatchScoreRequest request,
            User currentUser) {

        if (currentUser == null) {
            throw new UnauthorizedActionException("You must be logged in");
        }

        TournamentMatch match = findMatch(matchId);

        boolean isParticipant =
                (match.getPlayerOne() != null && match.getPlayerOne().getId().equals(currentUser.getId())) ||
                        (match.getPlayerTwo() != null && match.getPlayerTwo().getId().equals(currentUser.getId()));

        if (!isParticipant) {
            throw new UnauthorizedActionException("You can only submit scores for your own matches");
        }

        if (match.getStatus() == TournamentMatchStatus.COMPLETED) {
            throw new ValidationException("This match already has a score entered");
        }

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
            setScoreValidator.validate(setRequest);
            if (setRequest.getPlayerOneGames() > setRequest.getPlayerTwoGames()) {
                playerOneSetsWon++;
            } else if (setRequest.getPlayerTwoGames() > setRequest.getPlayerOneGames()) {
                playerTwoSetsWon++;
            }
        }

        User winner = resolveWinner(match, playerOneSetsWon, playerTwoSetsWon);
        User loser = winner.getId().equals(match.getPlayerOne().getId())
                ? match.getPlayerTwo()
                : match.getPlayerOne();

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
        match.setCompletedAt(LocalDateTime.now());
        match.setReportedBy(currentUser);
        TournamentMatch saved = tournamentMatchRepository.save(match);

        rankingService.awardMatchPoints(saved, winner, loser);

        advanceWinnerToNextRound(match, winner);

        return tournamentMatchMapper.toResponse(saved, currentUser);
    }

    /**
     * Save match sets from the live scoring engine's completed sets.
     * Used by LiveScoringService when a match finishes via live scoring.
     */
    @Transactional
    public void saveMatchSetsFromEngine(TournamentMatch match,
                                        java.util.List<com.TennisCenter.service.match.TennisScoreEngine.CompletedSet> completedSets) {
        matchSetRepository.deleteByMatchId(match.getId());

        int setNum = 1;
        for (var cs : completedSets) {
            MatchSet set = MatchSet.builder()
                    .match(match)
                    .setNumber(setNum++)
                    .playerOneGames(cs.getPlayerOneGames())
                    .playerTwoGames(cs.getPlayerTwoGames())
                    .playerOneTiebreakPoints(cs.getPlayerOneTiebreakPoints())
                    .playerTwoTiebreakPoints(cs.getPlayerTwoTiebreakPoints())
                    .build();
            matchSetRepository.save(set);
        }

        advanceWinnerToNextRound(match, match.getWinner());
    }

    /**
     * Award ranking points for a match completed via live scoring.
     */
    public void awardRankingPointsForMatch(TournamentMatch match, User winner, User loser) {
        rankingService.awardMatchPoints(match, winner, loser);
    }
}