package com.TennisCenter.service;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BracketService {

    private final TournamentRepository tournamentRepository;
    private final TournamentMatchRepository tournamentMatchRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentMatchService tournamentMatchService;

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

        return tournamentMatchService.getTournamentMatches(tournamentId, currentUser);
    }

    private void generateSingleEliminationFirstRound(Tournament tournament, List<User> participants) {
        int participantCount = participants.size();
        int bracketSize = nextPowerOfTwo(participantCount);
        int byes = bracketSize - participantCount;

        List<User> seededPlayers = new ArrayList<>(participants);
        List<User> playersWithByes = seededPlayers.subList(0, byes);
        List<User> remainingPlayers = seededPlayers.subList(byes, seededPlayers.size());

        int matchOrder = 1;

        for (int i = 0; i < remainingPlayers.size(); i += 2) {
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

    private void generateRoundRobinMatchesForGroup(
            Tournament tournament,
            List<User> groupPlayers,
            String groupName) {
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
}