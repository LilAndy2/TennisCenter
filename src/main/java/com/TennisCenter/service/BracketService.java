package com.TennisCenter.service;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
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
            throw new ValidationException("Bracket can only be generated for ongoing tournaments");
        }

        List<TournamentMatch> existingMatches =
                tournamentMatchRepository.findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId);

        if (!existingMatches.isEmpty()) {
            throw new ConflictException("Bracket already generated for this tournament");
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
            throw new ValidationException("Bracket requires at least 2 participants");
        }

        if (tournament.getBracketType() == TournamentBracketType.SINGLE_ELIMINATION) {
            generateSingleEliminationFirstRound(tournament, participants);
        } else {
            generateRoundRobinGroups(tournament, participants);
        }

        return tournamentMatchService.getTournamentMatches(tournamentId, currentUser);
    }

    public List<TournamentMatchResponse> generateKnockoutFromGroups(Long tournamentId, User currentUser) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (currentUser.getRole() != Role.ADMIN)
            throw new UnauthorizedActionException("Only admins can generate knockout bracket");

        List<TournamentMatch> groupMatches = tournamentMatchRepository
                .findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(tournamentId, TournamentMatchPhase.GROUP_STAGE);

        boolean allDone = groupMatches.stream()
                .allMatch(m -> m.getStatus() == TournamentMatchStatus.COMPLETED);
        if (!allDone)
            throw new ValidationException("All group stage matches must be completed before generating the knockout bracket");

        boolean knockoutExists = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream().anyMatch(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT);
        if (knockoutExists)
            throw new ConflictException("Knockout bracket already generated");

        List<User> knockoutParticipants = getTopPlayersFromGroups(groupMatches)
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        generateSingleEliminationFirstRound(tournament, knockoutParticipants);

        return tournamentMatchService.getTournamentMatches(tournamentId, currentUser);
    }

    private List<User> getTopPlayersFromGroups(List<TournamentMatch> groupMatches) {
        Map<String, List<TournamentMatch>> byGroup = groupMatches.stream()
                .collect(Collectors.groupingBy(TournamentMatch::getGroupName, LinkedHashMap::new, Collectors.toList()));

        List<User> result = new ArrayList<>();
        for (Map.Entry<String, List<TournamentMatch>> entry : byGroup.entrySet()) {
            Map<Long, int[]> winsMap = new LinkedHashMap<>();
            Map<Long, User> userMap = new LinkedHashMap<>();

            for (TournamentMatch m : entry.getValue()) {
                if (m.getPlayerOne() != null) {
                    winsMap.putIfAbsent(m.getPlayerOne().getId(), new int[]{0, 0});
                    userMap.put(m.getPlayerOne().getId(), m.getPlayerOne());
                }
                if (m.getPlayerTwo() != null) {
                    winsMap.putIfAbsent(m.getPlayerTwo().getId(), new int[]{0, 0});
                    userMap.put(m.getPlayerTwo().getId(), m.getPlayerTwo());
                }
                if (m.getWinner() != null) {
                    winsMap.get(m.getWinner().getId())[0]++;
                    Long loserId = m.getWinner().getId().equals(m.getPlayerOne().getId())
                            ? m.getPlayerTwo().getId() : m.getPlayerOne().getId();
                    winsMap.get(loserId)[1]++;
                }
            }

            winsMap.entrySet().stream()
                    .sorted((a, b) -> b.getValue()[0] - a.getValue()[0])
                    .limit(2)
                    .map(e -> userMap.get(e.getKey()))
                    .filter(Objects::nonNull)
                    .forEach(result::add);
        }
        return result;
    }

    private void generateSingleEliminationFirstRound(Tournament tournament, List<User> participants) {
        int bracketSize = nextPowerOfTwo(participants.size());
        int matchOrder = 1;

        // Pair players: seed 1 vs last, seed 2 vs second-to-last, etc.
        List<User> seeded = new ArrayList<>(participants);
        // Pad with nulls for BYEs
        while (seeded.size() < bracketSize) {
            seeded.add(null);
        }

        for (int i = 0; i < bracketSize / 2; i++) {
            User playerOne = seeded.get(i);
            User playerTwo = seeded.get(bracketSize - 1 - i);
            boolean isBye = playerTwo == null;

            TournamentMatch match = TournamentMatch.builder()
                    .tournament(tournament)
                    .playerOne(playerOne)
                    .playerTwo(playerTwo)
                    .winner(isBye ? playerOne : null)
                    .phase(TournamentMatchPhase.KNOCKOUT)
                    .status(isBye ? TournamentMatchStatus.COMPLETED : TournamentMatchStatus.SCHEDULED)
                    .roundNumber(1)
                    .matchOrder(matchOrder++)
                    .matchDate(tournament.getStartDate())
                    .build();

            tournamentMatchRepository.save(match);
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