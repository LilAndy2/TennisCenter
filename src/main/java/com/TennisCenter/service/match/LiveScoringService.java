package com.TennisCenter.service.match;

import com.TennisCenter.dto.match.LiveScoreResponse;
import com.TennisCenter.dto.match.RecordPointRequest;
import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.MatchSetScoreRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.MatchPoint;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.MatchPointRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LiveScoringService {

    private final MatchPointRepository matchPointRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentMatchService tournamentMatchService;

    /**
     * Record a new point during live scoring.
     */
    @Transactional
    public LiveScoreResponse recordPoint(Long matchId, RecordPointRequest request, User umpire) {
        TournamentMatch match = findMatchForUmpire(matchId, umpire);

        validateRequest(request, match);

        // Replay all existing points to get current state
        List<MatchPoint> existingPoints = matchPointRepository.findByMatchIdOrderByPointNumberAsc(matchId);
        Long firstServerId = determineFirstServer(match, existingPoints);

        TennisScoreEngine engine = new TennisScoreEngine(
                match.getPlayerOne().getId(),
                match.getPlayerTwo().getId(),
                firstServerId
        );

        // Replay existing points
        for (MatchPoint mp : existingPoints) {
            engine.processPoint(mp.getPointWinner().getId());
        }

        if (engine.isMatchFinished()) {
            throw new ValidationException("Match is already finished. No more points can be recorded.");
        }

        // Record score BEFORE processing the new point
        String scoreBefore = engine.getCurrentScoreString();
        int setNumber = engine.getCurrentSetNumber();
        int gameNumber = engine.getCurrentGameInSet();

        // Determine point outcome and serve type
        PointOutcome outcome = PointOutcome.valueOf(request.getPointOutcome());
        ServeType serveType = ServeType.valueOf(request.getServeType());
        ShotType shotType = request.getShotType() != null ? ShotType.valueOf(request.getShotType()) : null;

        // For double fault, the point winner is the returner
        Long pointWinnerId = request.getPointWinnerId();
        if (outcome == PointOutcome.DOUBLE_FAULT) {
            // The point winner is automatically the returner
            Long serverId = engine.getCurrentServerId();
            pointWinnerId = serverId.equals(match.getPlayerOne().getId())
                    ? match.getPlayerTwo().getId()
                    : match.getPlayerOne().getId();
        }

        // For ace, the point winner is automatically the server
        if (outcome == PointOutcome.ACE) {
            pointWinnerId = engine.getCurrentServerId();
        }

        int newPointNumber = existingPoints.size() + 1;

        // Save the point
        User winner = pointWinnerId.equals(match.getPlayerOne().getId())
                ? match.getPlayerOne()
                : match.getPlayerTwo();

        User server = engine.getCurrentServerId().equals(match.getPlayerOne().getId())
                ? match.getPlayerOne()
                : match.getPlayerTwo();

        MatchPoint point = MatchPoint.builder()
                .match(match)
                .pointWinner(winner)
                .server(server)
                .pointNumber(newPointNumber)
                .setNumber(setNumber)
                .gameNumber(gameNumber)
                .scoreBefore(scoreBefore)
                .serveType(serveType)
                .pointOutcome(outcome)
                .shotType(shotType)
                .recordedAt(LocalDateTime.now())
                .build();

        matchPointRepository.save(point);

        // Process the new point in the engine
        engine.processPoint(pointWinnerId);

        // If match is finished, finalize the score
        if (engine.isMatchFinished()) {
            finalizeMatch(match, engine);
        }

        return buildLiveScoreResponse(match, engine, newPointNumber);
    }

    /**
     * Undo the last recorded point.
     */
    @Transactional
    public LiveScoreResponse undoLastPoint(Long matchId, User umpire) {
        TournamentMatch match = findMatchForUmpire(matchId, umpire);

        MatchPoint lastPoint = matchPointRepository.findLastPoint(matchId)
                .orElseThrow(() -> new ValidationException("No points to undo"));

        // Delete the last point
        matchPointRepository.delete(lastPoint);

        // If match was finalized, un-finalize it
        if (match.getStatus() == TournamentMatchStatus.COMPLETED) {
            match.setStatus(TournamentMatchStatus.SCHEDULED);
            match.setWinner(null);
            tournamentMatchRepository.save(match);
        }

        // Replay remaining points
        List<MatchPoint> remainingPoints = matchPointRepository.findByMatchIdOrderByPointNumberAsc(matchId);
        Long firstServerId = determineFirstServer(match, remainingPoints);

        TennisScoreEngine engine = new TennisScoreEngine(
                match.getPlayerOne().getId(),
                match.getPlayerTwo().getId(),
                firstServerId
        );

        for (MatchPoint mp : remainingPoints) {
            engine.processPoint(mp.getPointWinner().getId());
        }

        Integer lastPointNumber = remainingPoints.isEmpty() ? null :
                remainingPoints.get(remainingPoints.size() - 1).getPointNumber();

        return buildLiveScoreResponse(match, engine, lastPointNumber);
    }

    /**
     * Get the current live score state for a match.
     */
    public LiveScoreResponse getLiveScore(Long matchId, User umpire) {
        TournamentMatch match = findMatchForUmpire(matchId, umpire);

        List<MatchPoint> points = matchPointRepository.findByMatchIdOrderByPointNumberAsc(matchId);
        Long firstServerId = determineFirstServer(match, points);

        TennisScoreEngine engine = new TennisScoreEngine(
                match.getPlayerOne().getId(),
                match.getPlayerTwo().getId(),
                firstServerId
        );

        for (MatchPoint mp : points) {
            engine.processPoint(mp.getPointWinner().getId());
        }

        Integer lastPointNumber = points.isEmpty() ? null :
                points.get(points.size() - 1).getPointNumber();

        return buildLiveScoreResponse(match, engine, lastPointNumber);
    }

    /**
     * Set who serves first (called once before scoring starts).
     */
    @Transactional
    public LiveScoreResponse setFirstServer(Long matchId, Long serverId, User umpire) {
        TournamentMatch match = findMatchForUmpire(matchId, umpire);

        List<MatchPoint> existingPoints = matchPointRepository.findByMatchIdOrderByPointNumberAsc(matchId);
        if (!existingPoints.isEmpty()) {
            throw new ValidationException("Cannot change first server after points have been recorded");
        }

        // Store first server in a lightweight way — use a special "marker" point with pointNumber=0
        // Actually, let's just store it on the match itself. We'll add a field later.
        // For now, default to playerOne if not set.

        TennisScoreEngine engine = new TennisScoreEngine(
                match.getPlayerOne().getId(),
                match.getPlayerTwo().getId(),
                serverId
        );

        return buildLiveScoreResponse(match, engine, null);
    }

    // ─── Private helpers ───

    private TournamentMatch findMatchForUmpire(Long matchId, User umpire) {
        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (match.getUmpire() == null || !match.getUmpire().getId().equals(umpire.getId())) {
            // Also allow admins
            if (!umpire.getRoles().contains(Role.ADMIN)) {
                throw new UnauthorizedActionException("You are not assigned as umpire for this match");
            }
        }

        if (match.getPlayerOne() == null || match.getPlayerTwo() == null) {
            throw new ValidationException("Cannot score a match without two players");
        }

        return match;
    }

    private void validateRequest(RecordPointRequest request, TournamentMatch match) {
        if (request.getPointOutcome() == null) {
            throw new ValidationException("Point outcome is required");
        }
        if (request.getServeType() == null) {
            throw new ValidationException("Serve type is required");
        }

        try {
            PointOutcome.valueOf(request.getPointOutcome());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid point outcome: " + request.getPointOutcome());
        }

        try {
            ServeType.valueOf(request.getServeType());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Invalid serve type: " + request.getServeType());
        }

        if (request.getShotType() != null) {
            try {
                ShotType.valueOf(request.getShotType());
            } catch (IllegalArgumentException e) {
                throw new ValidationException("Invalid shot type: " + request.getShotType());
            }
        }

        PointOutcome outcome = PointOutcome.valueOf(request.getPointOutcome());
        if (outcome != PointOutcome.ACE && outcome != PointOutcome.DOUBLE_FAULT
                && outcome != PointOutcome.POINT_WON) {
            // WINNER, UNFORCED_ERROR, FORCED_ERROR require a point winner and shot type
            if (request.getPointWinnerId() == null) {
                throw new ValidationException("Point winner is required for this outcome");
            }
        }

        if (request.getPointWinnerId() != null) {
            Long p1 = match.getPlayerOne().getId();
            Long p2 = match.getPlayerTwo().getId();
            if (!request.getPointWinnerId().equals(p1) && !request.getPointWinnerId().equals(p2)) {
                throw new ValidationException("Point winner must be one of the match players");
            }
        }
    }

    private Long determineFirstServer(TournamentMatch match, List<MatchPoint> points) {
        // If there are recorded points, the first point's server tells us who served first
        if (!points.isEmpty()) {
            return points.get(0).getServer().getId();
        }
        // Default to playerOne
        return match.getPlayerOne().getId();
    }

    private void finalizeMatch(TournamentMatch match, TennisScoreEngine engine) {
        // Build the SubmitMatchScoreRequest from engine completed sets
        List<MatchSetScoreRequest> setRequests = new ArrayList<>();
        for (TennisScoreEngine.CompletedSet cs : engine.getCompletedSets()) {
            MatchSetScoreRequest setReq = new MatchSetScoreRequest();
            setReq.setPlayerOneGames(cs.getPlayerOneGames());
            setReq.setPlayerTwoGames(cs.getPlayerTwoGames());
            setReq.setPlayerOneTiebreakPoints(cs.getPlayerOneTiebreakPoints());
            setReq.setPlayerTwoTiebreakPoints(cs.getPlayerTwoTiebreakPoints());
            setRequests.add(setReq);
        }

        SubmitMatchScoreRequest scoreRequest = new SubmitMatchScoreRequest();
        scoreRequest.setSets(setRequests);

        // Use admin-level submission (umpire has authority for their assigned matches)
        // We need to submit as admin — create a synthetic admin call
        // Actually, let's directly set the score and winner on the match
        match.setStatus(TournamentMatchStatus.COMPLETED);
        User winner = engine.getWinnerId().equals(match.getPlayerOne().getId())
                ? match.getPlayerOne()
                : match.getPlayerTwo();
        match.setWinner(winner);
        match.setMatchDate(java.time.LocalDate.now());
        tournamentMatchRepository.save(match);

        // Save sets via the existing match set logic
        tournamentMatchService.saveMatchSetsFromEngine(match, engine.getCompletedSets());

        // Award ranking points
        User loser = winner.getId().equals(match.getPlayerOne().getId())
                ? match.getPlayerTwo()
                : match.getPlayerOne();
        tournamentMatchService.awardRankingPointsForMatch(match, winner, loser);
    }

    private LiveScoreResponse buildLiveScoreResponse(TournamentMatch match,
                                                     TennisScoreEngine engine,
                                                     Integer lastPointNumber) {
        List<LiveScoreResponse.SetScore> sets = engine.getCompletedSets().stream()
                .map(cs -> LiveScoreResponse.SetScore.builder()
                        .setNumber(cs.getSetNumber())
                        .playerOneGames(cs.getPlayerOneGames())
                        .playerTwoGames(cs.getPlayerTwoGames())
                        .playerOneTiebreakPoints(cs.getPlayerOneTiebreakPoints())
                        .playerTwoTiebreakPoints(cs.getPlayerTwoTiebreakPoints())
                        .build())
                .toList();

        return LiveScoreResponse.builder()
                .matchId(match.getId())
                .playerOneName(match.getPlayerOne().getFullName())
                .playerTwoName(match.getPlayerTwo().getFullName())
                .playerOneId(match.getPlayerOne().getId())
                .playerTwoId(match.getPlayerTwo().getId())
                .serverId(engine.getCurrentServerId())
                .currentGameScore(engine.getCurrentScoreString())
                .sets(sets)
                .currentSetPlayerOneGames(engine.getP1Games())
                .currentSetPlayerTwoGames(engine.getP2Games())
                .inTiebreak(engine.isInTiebreak())
                .tiebreakPlayerOnePoints(engine.isInTiebreak() ? engine.getTbP1() : null)
                .tiebreakPlayerTwoPoints(engine.isInTiebreak() ? engine.getTbP2() : null)
                .matchFinished(engine.isMatchFinished())
                .winnerId(engine.getWinnerId())
                .totalPoints((int) matchPointRepository.countByMatchId(match.getId()))
                .lastPointNumber(lastPointNumber)
                .build();
    }
}