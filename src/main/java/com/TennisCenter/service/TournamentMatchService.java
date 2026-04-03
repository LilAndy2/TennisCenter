package com.TennisCenter.service;

import com.TennisCenter.dto.match.MatchSetResponse;
import com.TennisCenter.dto.match.MatchSetScoreRequest;
import com.TennisCenter.dto.match.SubmitMatchScoreRequest;
import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.dto.match.GroupStandingPlayerResponse;
import com.TennisCenter.dto.match.GroupStandingResponse;
import com.TennisCenter.dto.match.ScheduleMatchRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.MatchSetRepository;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.repository.CourtRepository;
import com.TennisCenter.repository.TournamentLocationRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TournamentMatchService {

    private final TournamentRepository tournamentRepository;
    private final MatchSetRepository matchSetRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final CourtRepository courtRepository;

    public List<TournamentMatchResponse> generateBracket(Long tournamentId, User currentUser) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can generate brackets");
        }

        if (tournament.getStatus() != TournamentStatus.ONGOING) {
            throw new IllegalStateException("Bracket can only be generated for ongoing tournaments");
        }

        List<TournamentMatch> existingMatches =
                tournamentMatchRepository.findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId);

        if (!existingMatches.isEmpty()) {
            throw new IllegalStateException("Bracket already generated for this tournament");
        }

        List<User> participants = tournamentRegistrationRepository
                .findByTournamentIdOrderByRegisteredAtAsc(tournamentId)
                .stream()
                .map(TournamentRegistration::getPlayer)
                .sorted(Comparator
                        .comparing(User::getRankingPoints, Comparator.nullsFirst(Comparator.reverseOrder()))
                        .thenComparing(User::getWins, Comparator.nullsFirst(Comparator.reverseOrder()))
                        .thenComparing(User::getLosses, Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();

        if (participants.size() < 2) {
            throw new IllegalStateException("Bracket requires at least 2 participants");
        }

        if (tournament.getBracketType() == TournamentBracketType.SINGLE_ELIMINATION) {
            generateSingleEliminationFirstRound(tournament, participants);
        } else {
            generateRoundRobinGroups(tournament, participants);
        }

        return getTournamentMatches(tournamentId, currentUser);
    }

    private void generateSingleEliminationFirstRound(Tournament tournament, List<User> participants) {
        int participantCount = participants.size();
        int bracketSize = nextPowerOfTwo(participantCount);
        int byes = bracketSize - participantCount;

        List<User> seededPlayers = new ArrayList<>(participants);
        List<User> playersWithByes = seededPlayers.subList(0, byes);
        List<User> remainingPlayers = seededPlayers.subList(byes, seededPlayers.size());

        int matchOrder = 1;

        for (int i = 0; i < remainingPlayers.size(); i+=2) {
            User playerOne = remainingPlayers.get(i);
            User playerTwo = i + 1 < remainingPlayers.size() ? remainingPlayers.get(i + 1) : null;

            TournamentMatch match = TournamentMatch.builder()
                    .tournament(tournament)
                    .playerOne(playerOne)
                    .playerTwo(playerTwo)
                    .winner(null)
                    .phase(TournamentMatchPhase.KNOCKOUT)
                    .status(TournamentMatchStatus.SCHEDULED)
                    .roundNumber(1)
                    .groupName(null)
                    .matchOrder(matchOrder++)
                    .matchDate(tournament.getStartDate())
                    .build();

            tournamentMatchRepository.save(match);
        }

        if (!playersWithByes.isEmpty()) {
            int byeOrder = 1000;
            for (User byePlayer : playersWithByes) {
                TournamentMatch byeMatch = TournamentMatch.builder()
                        .tournament(tournament)
                        .playerOne(byePlayer)
                        .playerTwo(null)
                        .winner(byePlayer)
                        .phase(TournamentMatchPhase.KNOCKOUT)
                        .status(TournamentMatchStatus.COMPLETED)
                        .roundNumber(1)
                        .groupName(null)
                        .matchOrder(byeOrder++)
                        .matchDate(tournament.getStartDate())
                        .build();

                tournamentMatchRepository.save(byeMatch);
            }
        }
    }

    private void generateRoundRobinGroups(Tournament tournament, List<User> participants) {
        List<List<User>> groups = splitIntoGroups(participants);

        int groupIndex = 0;
        for (List<User> groupPlayers : groups) {
            String groupName = "Group" + (char) ('A' + groupIndex);
            generateRoundRobinMatchesForGroup(tournament, groupPlayers, groupName);
            groupIndex++;
        }
    }

    private void generateRoundRobinMatchesForGroup(Tournament tournament, List<User> groupPlayers, String groupName) {
        int matchOrder = 1;

        for (int i = 0; i < groupPlayers.size(); i++) {
            for (int j = i + 1; j < groupPlayers.size(); j++) {
                TournamentMatch match = TournamentMatch.builder()
                        .tournament(tournament)
                        .playerOne(groupPlayers.get(i))
                        .playerTwo(groupPlayers.get(j))
                        .winner(null)
                        .phase(TournamentMatchPhase.GROUP_STAGE)
                        .status(TournamentMatchStatus.SCHEDULED)
                        .roundNumber(1)
                        .groupName(groupName)
                        .matchOrder(matchOrder++)
                        .matchDate(tournament.getStartDate())
                        .build();

                tournamentMatchRepository.save(match);
            }
        }
    }

    private List<List<User>> splitIntoGroups(List<User> participants) {
        int size = participants.size();

        int groupCount;
        if (size <= 8) {
            groupCount = 2;
        } else if (size <= 16) {
            groupCount = 4;
        } else {
            groupCount = Math.max(4, size / 4);
        }

        List<List<User>> groups = new ArrayList<>();
        for (int i = 0; i < groupCount; i++) {
            groups.add(new ArrayList<>());
        }

        for (int i = 0; i < participants.size(); i++) {
            groups.get(i % groupCount).add(participants.get(i));
        }

        return groups.stream()
                .filter(group -> !group.isEmpty())
                .collect(Collectors.toList());
    }

    private int nextPowerOfTwo(int number) {
        int power = 1;
        while (power < number) {
            power *= 2;
        }
        return power;
    }

    public List<TournamentMatchResponse> getTournamentMatches(Long tournamentId, User currentUser) {
        List<TournamentMatch> matches =
                tournamentMatchRepository.findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId);

        return matches.stream()
                .map(match -> mapToResponse(match, currentUser))
                .toList();
    }

    @Transactional
    public TournamentMatchResponse submitMatchScore(Long matchId, SubmitMatchScoreRequest request, User currentUser) {
        if (currentUser == null || currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can submit match scores");
        }

        TournamentMatch match = tournamentMatchRepository.findById(matchId)
                .orElseThrow(() -> new ResourceNotFoundException("Match not found"));

        if (request == null || request.getSets() == null || request.getSets().isEmpty()) {
            throw new IllegalArgumentException("At least one set is required");
        }
        if (request.getSets().size() > 3) {
            throw new IllegalArgumentException("Maximum 3 sets are allowed");
        }
        if (match.getPlayerOne() == null || match.getPlayerTwo() == null) {
            throw new IllegalStateException("Cannot submit score for a match without two players");
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
            throw new IllegalArgumentException("Sets cannot end in a tie");
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
        TournamentMatch savedMatch = tournamentMatchRepository.save(match);

        return mapToResponse(savedMatch, currentUser);
    }

    private void validateSetScore(MatchSetScoreRequest setRequest) {
        if (setRequest.getSetNumber() == null || setRequest.getSetNumber() < 1) {
            throw new IllegalArgumentException("Set number must be at least 1");
        }
        if (setRequest.getPlayerOneGames() == null || setRequest.getPlayerTwoGames() == null) {
            throw new IllegalArgumentException("Set scores are required");
        }

        int playerOneGames = setRequest.getPlayerOneGames();
        int playerTwoGames = setRequest.getPlayerTwoGames();
        if (playerOneGames < 0 || playerTwoGames < 0) {
            throw new IllegalArgumentException("Games cannot be negative");
        }
        if (playerOneGames == playerTwoGames) {
            throw new IllegalArgumentException("A set cannot end in a draw");
        }

        int winnerGames = Math.max(playerOneGames, playerTwoGames);
        int loserGames = Math.min(playerOneGames, playerTwoGames);
        boolean isTiebreakSet = winnerGames == 7 && loserGames == 6;

        Integer playerOneTiebreak = setRequest.getPlayerOneTiebreakPoints();
        Integer playerTwoTiebreak = setRequest.getPlayerTwoTiebreakPoints();

        if ((playerOneTiebreak == null) != (playerTwoTiebreak == null)) {
            throw new IllegalArgumentException("Both tie-break values must be provided");
        }

        if (winnerGames == 6) {
            if (loserGames > 4) {
                throw new IllegalArgumentException("Invalid set score. Allowed scores include 6-0 to 6-4");
            }
            if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                throw new IllegalArgumentException("Tie-break points are allowed only for 7-6 sets");
            }
            return;
        }

        if (winnerGames == 7) {
            if (loserGames == 5) {
                if (playerOneTiebreak != null || playerTwoTiebreak != null) {
                    throw new IllegalArgumentException("Tie-break points are allowed only for 7-6 sets");
                }
                return;
            }

            if (!isTiebreakSet) {
                throw new IllegalArgumentException("Invalid set score. Allowed scores include 7-5 and 7-6");
            }
            if (playerOneTiebreak == null || playerTwoTiebreak == null) {
                throw new IllegalArgumentException("Tie-break points are required for 7-6 sets");
            }
            if (playerOneTiebreak < 0 || playerTwoTiebreak < 0) {
                throw new IllegalArgumentException("Tie-break points cannot be negative");
            }

            boolean playerOneWonSet = playerOneGames > playerTwoGames;
            int winnerTiebreak = playerOneWonSet ? playerOneTiebreak : playerTwoTiebreak;
            int loserTiebreak = playerOneWonSet ? playerTwoTiebreak : playerOneTiebreak;
            if (winnerTiebreak < 7 || winnerTiebreak - loserTiebreak < 2) {
                throw new IllegalArgumentException("Invalid tie-break score. Winner must have at least 7 points and 2-point difference");
            }
            return;
        }

        throw new IllegalArgumentException("Invalid set score. Allowed winner game values are 6 or 7");
    }

    private TournamentMatchResponse mapToResponse(TournamentMatch match, User currentUser) {
        List<MatchSetResponse> sets = matchSetRepository.findByMatchIdOrderBySetNumberAsc(match.getId())
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
                        (match.getPlayerOne() != null && match.getPlayerOne().getId().equals(currentUser.getId())) ||
                                (match.getPlayerTwo() != null && match.getPlayerTwo().getId().equals(currentUser.getId()));
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
                .scheduledTime(match.getScheduledTime() != null ? match.getScheduledTime().toString() : null)
                .courtId(match.getCourt() != null ? match.getCourt().getId() : null)
                .courtNumber(match.getCourt() != null ? match.getCourt().getCourtNumber() : null)
                .locationName(match.getCourt() != null ? match.getCourt().getLocation().getName() : null)
                .build();
    }

    public List<GroupStandingResponse> getGroupStanding(Long tournamentId) {
        List<TournamentMatch> groupMatches = tournamentMatchRepository
                .findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                        tournamentId,
                        TournamentMatchPhase.GROUP_STAGE
                );

        Map<String, Map<Long, GroupStandingAccumulator>> standingsByGroup = new LinkedHashMap<>();

        for (TournamentMatch match : groupMatches) {
            if (match.getGroupName() == null) {
                continue;
            }

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

            if (match.getStatus() != TournamentMatchStatus.COMPLETED) {
                continue;
            }

            if (match.getPlayerOne() == null || match.getPlayerTwo() == null) {
                continue;
            }

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
            String groupName = entry.getKey();
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
                    .groupName(groupName)
                    .players(players)
                    .build());
        }

        return result;
    }

    @Transactional
    public TournamentMatchResponse scheduleMatch(Long matchId, ScheduleMatchRequest request, User currentUser) {
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
            int totalSets = setsWon + setsLost;
            if (totalSets == 0) {
                return 0.0;
            }
            return ((double) setsWon / totalSets) * 100.0;
        }

        private double getGamesWinPercentage() {
            int totalGames = gamesWon + gamesLost;
            if (totalGames == 0) {
                return 0.0;
            }
            return ((double) gamesWon / totalGames) * 100.0;
        }
    }
}
