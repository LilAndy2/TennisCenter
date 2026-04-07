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
        int totalRounds = (int) (Math.log(bracketSize) / Math.log(2));
        int numSeeds = bracketSize / 4;

        // Build slot array using seeded positions + random for the rest
        int[] finalSlots = buildBracketSlots(bracketSize, participants.size(), numSeeds);

        // Map slot positions to players (null = BYE)
        User[] slots = new User[bracketSize];
        for (int i = 0; i < bracketSize; i++) {
            int participantIndex = finalSlots[i];
            slots[i] = (participantIndex >= 0 && participantIndex < participants.size())
                    ? participants.get(participantIndex)
                    : null;
        }

        // Save all round 1 matches
        List<TournamentMatch> round1Matches = new ArrayList<>();
        int matchOrder = 1;
        for (int i = 0; i < bracketSize; i += 2) {
            User playerOne = slots[i];
            User playerTwo = slots[i + 1];

            Integer seedOne = null;
            if (playerOne != null) {
                int idx = participants.indexOf(playerOne);
                if (idx >= 0 && idx < numSeeds) seedOne = idx + 1;
            }
            Integer seedTwo = null;
            if (playerTwo != null) {
                int idx = participants.indexOf(playerTwo);
                if (idx >= 0 && idx < numSeeds) seedTwo = idx + 1;
            }

            User winner = null;
            TournamentMatchStatus status = TournamentMatchStatus.SCHEDULED;
            if (playerOne == null && playerTwo != null) {
                winner = playerTwo;
                status = TournamentMatchStatus.COMPLETED;
            } else if (playerTwo == null && playerOne != null) {
                winner = playerOne;
                status = TournamentMatchStatus.COMPLETED;
            }

            TournamentMatch match = TournamentMatch.builder()
                    .tournament(tournament)
                    .playerOne(playerOne)
                    .playerTwo(playerTwo)
                    .playerOneSeed(seedOne)
                    .playerTwoSeed(seedTwo)
                    .winner(winner)
                    .phase(TournamentMatchPhase.KNOCKOUT)
                    .status(status)
                    .roundNumber(1)
                    .matchOrder(matchOrder++)
                    .matchDate(tournament.getStartDate())
                    .build();

            round1Matches.add(tournamentMatchRepository.save(match));
        }

        // Create placeholder matches for subsequent rounds
        for (int round = 2; round <= totalRounds; round++) {
            int matchesInRound = bracketSize / (int) Math.pow(2, round);
            for (int i = 1; i <= matchesInRound; i++) {
                tournamentMatchRepository.save(TournamentMatch.builder()
                        .tournament(tournament)
                        .playerOne(null)
                        .playerTwo(null)
                        .winner(null)
                        .phase(TournamentMatchPhase.KNOCKOUT)
                        .status(TournamentMatchStatus.SCHEDULED)
                        .roundNumber(round)
                        .matchOrder(i)
                        .matchDate(tournament.getStartDate())
                        .build());
            }
        }

        // Pre-place BYE winners into round 2 slots
        if (totalRounds >= 2) {
            List<TournamentMatch> round2Matches = tournamentMatchRepository
                    .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournament.getId())
                    .stream()
                    .filter(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT && m.getRoundNumber() == 2)
                    .sorted(Comparator.comparingInt(m -> m.getMatchOrder() == null ? 0 : m.getMatchOrder()))
                    .toList();

            for (TournamentMatch r1Match : round1Matches) {
                if (r1Match.getWinner() == null) continue;
                int r1Order = r1Match.getMatchOrder() == null ? 1 : r1Match.getMatchOrder();
                int nextMatchIndex = (r1Order - 1) / 2;
                if (nextMatchIndex >= round2Matches.size()) continue;
                TournamentMatch nextMatch = round2Matches.get(nextMatchIndex);
                if (r1Order % 2 == 1) {
                    nextMatch.setPlayerOne(r1Match.getWinner());
                } else {
                    nextMatch.setPlayerTwo(r1Match.getWinner());
                }
                tournamentMatchRepository.save(nextMatch);
            }
        }
    }

    private int[] buildBracketSlots(int bracketSize, int numParticipants, int numSeeds) {
        int numByes = bracketSize - numParticipants;

        int[] seededPositions = buildSeededPositions(bracketSize, numSeeds);

        int[] finalSlots = new int[bracketSize];
        Arrays.fill(finalSlots, -1);

        // Place seeds in their fixed positions
        for (int i = 0; i < numSeeds; i++) {
            finalSlots[seededPositions[i]] = i;
        }

        // Place BYEs — first against top seeds (up to min(numByes, numSeeds)),
        // remaining BYEs go into random free slots
        int byesPlacedAgainstSeeds = Math.min(numByes, numSeeds);
        Set<Integer> takenSlots = new HashSet<>();
        for (int i = 0; i < numSeeds; i++) {
            takenSlots.add(seededPositions[i]);
        }

        // Place BYEs opposite the top seeds first
        for (int i = 0; i < byesPlacedAgainstSeeds; i++) {
            int seedSlot = seededPositions[i];
            int pairedSlot = (seedSlot % 2 == 0) ? seedSlot + 1 : seedSlot - 1;
            finalSlots[pairedSlot] = bracketSize; // BYE sentinel
            takenSlots.add(pairedSlot);
        }

        // Collect remaining free slots
        List<Integer> freeSlots = new ArrayList<>();
        for (int i = 0; i < bracketSize; i++) {
            if (finalSlots[i] == -1) freeSlots.add(i);
        }
        Collections.shuffle(freeSlots);

        // Remaining BYEs go into random free slots (paired, so we pick pairs)
        int remainingByes = numByes - byesPlacedAgainstSeeds;
        List<Integer> freeSlotsForByes = new ArrayList<>();
        // Pick slots in pairs so a BYE doesn't end up vs another BYE
        // Group free slots into pairs by match
        Map<Integer, List<Integer>> matchPairs = new LinkedHashMap<>();
        for (int slot : freeSlots) {
            int matchIndex = slot / 2;
            matchPairs.computeIfAbsent(matchIndex, k -> new ArrayList<>()).add(slot);
        }
        // Only pick from pairs that have 2 free slots (both players TBD)
        List<Integer> availableMatchIndices = matchPairs.entrySet().stream()
                .filter(e -> e.getValue().size() == 2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        Collections.shuffle(availableMatchIndices);

        for (int i = 0; i < remainingByes && i < availableMatchIndices.size(); i++) {
            List<Integer> pair = matchPairs.get(availableMatchIndices.get(i));
            // Pick one slot in the pair for the BYE, the other gets an unseeded player
            int byeSlot = pair.get(0);
            finalSlots[byeSlot] = bracketSize; // BYE sentinel
            freeSlots.remove(Integer.valueOf(byeSlot));
        }

        // Refresh free slots after BYE placement
        List<Integer> remainingFreeSlots = new ArrayList<>();
        for (int i = 0; i < bracketSize; i++) {
            if (finalSlots[i] == -1) remainingFreeSlots.add(i);
        }
        Collections.shuffle(remainingFreeSlots);

        // Place unseeded players into remaining free slots
        List<Integer> unseeded = new ArrayList<>();
        for (int i = numSeeds; i < numParticipants; i++) unseeded.add(i);
        Collections.shuffle(unseeded);

        for (int i = 0; i < unseeded.size() && i < remainingFreeSlots.size(); i++) {
            finalSlots[remainingFreeSlots.get(i)] = unseeded.get(i);
        }

        return finalSlots;
    }

    // Returns the fixed slot positions for the top N seeds
    // Seed 1 → slot 0 (top), Seed 2 → slot size-1 (bottom)
    // Seed 3 → top of bottom half, Seed 4 → bottom of top half
    // Seeds 5-8 → quarter positions
    private int[] buildSeededPositions(int size, int numSeeds) {
        // All seed positions must be EVEN so their paired opponent slot is pos+1
        int[] positions = new int[numSeeds];
        if (numSeeds == 0) return positions;

        positions[0] = 0;                    // Seed 1: slot 0 (top)
        if (numSeeds == 1) return positions;

        positions[1] = size - 2;            // Seed 2: slot size-2 (bottom pair, even)
        if (numSeeds == 2) return positions;

        if (numSeeds >= 4) {
            positions[2] = size / 2;        // Seed 3: top of bottom half (even)
            positions[3] = size / 2 - 2;    // Seed 4: bottom of top half (even)
        } else {
            positions[2] = Math.random() < 0.5 ? size / 2 : size / 2 - 2;
        }
        if (numSeeds == 4) return positions;

        if (numSeeds >= 8) {
            positions[4] = size / 4;        // Seed 5
            positions[5] = size * 3 / 4;   // Seed 6
            positions[6] = size / 4 - 2;   // Seed 7
            positions[7] = size * 3 / 4 - 2; // Seed 8
        }

        return positions;
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