package com.TennisCenter.service.bracket;

import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.repository.TournamentMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SingleEliminationService {

    private final TournamentMatchRepository tournamentMatchRepository;

    public void generateFirstRound(Tournament tournament, List<User> participants) {
        int bracketSize = nextPowerOfTwo(participants.size());
        int totalRounds = (int) (Math.log(bracketSize) / Math.log(2));
        int numSeeds    = bracketSize / 4;

        int[] finalSlots = buildBracketSlots(bracketSize, participants.size(), numSeeds);

        User[] slots = new User[bracketSize];
        for (int i = 0; i < bracketSize; i++) {
            int participantIndex = finalSlots[i];
            slots[i] = (participantIndex >= 0 && participantIndex < participants.size())
                    ? participants.get(participantIndex)
                    : null;
        }

        List<TournamentMatch> round1Matches = saveRound1Matches(
                tournament, participants, slots, bracketSize, numSeeds);

        savePlaceholderRounds(tournament, bracketSize, totalRounds);

        if (totalRounds >= 2) {
            placeByeWinnersIntoRound2(tournament, round1Matches);
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private List<TournamentMatch> saveRound1Matches(
            Tournament tournament,
            List<User> participants,
            User[] slots,
            int bracketSize,
            int numSeeds) {

        List<TournamentMatch> round1Matches = new ArrayList<>();
        int matchOrder = 1;

        for (int i = 0; i < bracketSize; i += 2) {
            User playerOne = slots[i];
            User playerTwo = slots[i + 1];

            Integer seedOne = resolveSeed(playerOne, participants, numSeeds);
            Integer seedTwo = resolveSeed(playerTwo, participants, numSeeds);

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

        return round1Matches;
    }

    private void savePlaceholderRounds(Tournament tournament, int bracketSize, int totalRounds) {
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
    }

    private void placeByeWinnersIntoRound2(
            Tournament tournament,
            List<TournamentMatch> round1Matches) {

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

    private int[] buildBracketSlots(int bracketSize, int numParticipants, int numSeeds) {
        int numByes = bracketSize - numParticipants;
        int[] seededPositions = buildSeededPositions(bracketSize, numSeeds);

        int[] finalSlots = new int[bracketSize];
        Arrays.fill(finalSlots, -1);

        for (int i = 0; i < numSeeds; i++) {
            finalSlots[seededPositions[i]] = i;
        }

        Set<Integer> takenSlots = new HashSet<>();
        for (int i = 0; i < numSeeds; i++) {
            takenSlots.add(seededPositions[i]);
        }

        int byesAgainstSeeds = Math.min(numByes, numSeeds);
        for (int i = 0; i < byesAgainstSeeds; i++) {
            int seedSlot  = seededPositions[i];
            int pairedSlot = (seedSlot % 2 == 0) ? seedSlot + 1 : seedSlot - 1;
            finalSlots[pairedSlot] = bracketSize;
            takenSlots.add(pairedSlot);
        }

        List<Integer> freeSlots = new ArrayList<>();
        for (int i = 0; i < bracketSize; i++) {
            if (finalSlots[i] == -1) freeSlots.add(i);
        }
        Collections.shuffle(freeSlots);

        int remainingByes = numByes - byesAgainstSeeds;
        Map<Integer, List<Integer>> matchPairs = new LinkedHashMap<>();
        for (int slot : freeSlots) {
            matchPairs.computeIfAbsent(slot / 2, k -> new ArrayList<>()).add(slot);
        }

        List<Integer> availableMatchIndices = matchPairs.entrySet().stream()
                .filter(e -> e.getValue().size() == 2)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        Collections.shuffle(availableMatchIndices);

        for (int i = 0; i < remainingByes && i < availableMatchIndices.size(); i++) {
            int byeSlot = matchPairs.get(availableMatchIndices.get(i)).get(0);
            finalSlots[byeSlot] = bracketSize;
            freeSlots.remove(Integer.valueOf(byeSlot));
        }

        List<Integer> remainingFreeSlots = new ArrayList<>();
        for (int i = 0; i < bracketSize; i++) {
            if (finalSlots[i] == -1) remainingFreeSlots.add(i);
        }
        Collections.shuffle(remainingFreeSlots);

        List<Integer> unseeded = new ArrayList<>();
        for (int i = numSeeds; i < numParticipants; i++) unseeded.add(i);
        Collections.shuffle(unseeded);

        for (int i = 0; i < unseeded.size() && i < remainingFreeSlots.size(); i++) {
            finalSlots[remainingFreeSlots.get(i)] = unseeded.get(i);
        }

        return finalSlots;
    }

    private int[] buildSeededPositions(int size, int numSeeds) {
        int[] positions = new int[numSeeds];
        if (numSeeds == 0) return positions;

        positions[0] = 0;
        if (numSeeds == 1) return positions;

        positions[1] = size - 2;
        if (numSeeds == 2) return positions;

        if (numSeeds >= 4) {
            positions[2] = size / 2;
            positions[3] = size / 2 - 2;
        } else {
            positions[2] = Math.random() < 0.5 ? size / 2 : size / 2 - 2;
        }
        if (numSeeds == 4) return positions;

        if (numSeeds >= 8) {
            positions[4] = size / 4;
            positions[5] = size * 3 / 4;
            positions[6] = size / 4 - 2;
            positions[7] = size * 3 / 4 - 2;
        }

        return positions;
    }

    private Integer resolveSeed(User player, List<User> participants, int numSeeds) {
        if (player == null) return null;
        int idx = participants.indexOf(player);
        return (idx >= 0 && idx < numSeeds) ? idx + 1 : null;
    }

    public int nextPowerOfTwo(int number) {
        int power = 1;
        while (power < number) power *= 2;
        return power;
    }
}