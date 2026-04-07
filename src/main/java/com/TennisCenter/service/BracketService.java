package com.TennisCenter.service;

import com.TennisCenter.dto.match.TournamentMatchResponse;
import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.TournamentRegistration;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentBracketType;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import com.TennisCenter.model.enums.TournamentMatchStatus;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.model.Tournament;
import com.TennisCenter.repository.TournamentMatchRepository;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.bracket.RoundRobinService;
import com.TennisCenter.service.bracket.SingleEliminationService;
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
    private final SingleEliminationService singleEliminationService;
    private final RoundRobinService roundRobinService;

    public List<TournamentMatchResponse> generateBracket(Long tournamentId, User currentUser) {
        Tournament tournament = findTournament(tournamentId);

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can generate brackets");
        }
        if (tournament.getStatus() != TournamentStatus.ONGOING) {
            throw new ValidationException("Bracket can only be generated for ongoing tournaments");
        }

        boolean alreadyGenerated = !tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .isEmpty();
        if (alreadyGenerated) {
            throw new ConflictException("Bracket already generated for this tournament");
        }

        List<User> participants = loadRankedParticipants(tournamentId);
        if (participants.size() < 2) {
            throw new ValidationException("Bracket requires at least 2 participants");
        }

        if (tournament.getBracketType() == TournamentBracketType.SINGLE_ELIMINATION) {
            singleEliminationService.generateFirstRound(tournament, participants);
        } else {
            roundRobinService.generateGroups(tournament, participants);
        }

        return tournamentMatchService.getTournamentMatches(tournamentId, currentUser);
    }

    public List<TournamentMatchResponse> generateKnockoutFromGroups(
            Long tournamentId, User currentUser) {

        Tournament tournament = findTournament(tournamentId);

        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedActionException("Only admins can generate knockout bracket");
        }

        List<TournamentMatch> groupMatches = tournamentMatchRepository
                .findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
                        tournamentId, TournamentMatchPhase.GROUP_STAGE);

        boolean allDone = groupMatches.stream()
                .allMatch(m -> m.getStatus() == TournamentMatchStatus.COMPLETED);
        if (!allDone) {
            throw new ValidationException(
                    "All group stage matches must be completed before generating the knockout bracket");
        }

        boolean knockoutExists = tournamentMatchRepository
                .findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(tournamentId)
                .stream()
                .anyMatch(m -> m.getPhase() == TournamentMatchPhase.KNOCKOUT);
        if (knockoutExists) {
            throw new ConflictException("Knockout bracket already generated");
        }

        List<User> knockoutParticipants = getTopPlayersFromGroups(groupMatches)
                .stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        singleEliminationService.generateFirstRound(tournament, knockoutParticipants);

        return tournamentMatchService.getTournamentMatches(tournamentId, currentUser);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Tournament findTournament(Long tournamentId) {
        return tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private List<User> loadRankedParticipants(Long tournamentId) {
        return tournamentRegistrationRepository
                .findByTournamentIdOrderByRegisteredAtAsc(tournamentId)
                .stream()
                .map(TournamentRegistration::getPlayer)
                .sorted(Comparator
                        .comparing(User::getRankingPoints,
                                Comparator.nullsFirst(Comparator.reverseOrder()))
                        .thenComparing(User::getWins,
                                Comparator.nullsFirst(Comparator.reverseOrder()))
                        .thenComparing(User::getLosses,
                                Comparator.nullsFirst(Comparator.naturalOrder())))
                .toList();
    }

    private List<User> getTopPlayersFromGroups(List<TournamentMatch> groupMatches) {
        Map<String, List<TournamentMatch>> byGroup = groupMatches.stream()
                .collect(Collectors.groupingBy(
                        TournamentMatch::getGroupName,
                        LinkedHashMap::new,
                        Collectors.toList()));

        List<User> result = new ArrayList<>();

        for (Map.Entry<String, List<TournamentMatch>> entry : byGroup.entrySet()) {
            Map<Long, int[]> winsMap = new LinkedHashMap<>();
            Map<Long, User> userMap  = new LinkedHashMap<>();

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
                            ? m.getPlayerTwo().getId()
                            : m.getPlayerOne().getId();
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
}