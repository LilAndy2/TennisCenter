package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.TournamentParticipantResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.tournament.TournamentMapper;
import com.TennisCenter.service.tournament.TournamentStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentRegistrationService {

    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentMapper tournamentMapper;
    private final TournamentStatusService tournamentStatusService;

    public TournamentResponse registerToTournament(Long tournamentId, User currentUser) {
        Tournament tournament = findTournament(tournamentId);

        if (currentUser.getRole() != Role.PLAYER) {
            throw new UnauthorizedActionException("Only players can register to tournaments");
        }
        if (currentUser.getPlayerLevel() == null) {
            throw new UnauthorizedActionException(
                    "Player level is required for tournament registration");
        }
        if (currentUser.getPlayerLevel().ordinal() > tournament.getLevel().ordinal()) {
            throw new UnauthorizedActionException(
                    "You cannot register for a tournament below your level");
        }
        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new UnauthorizedActionException(
                    "You can register only for upcoming tournaments");
        }
        if (tournament.isFull()) {
            throw new ConflictException("This tournament is already full");
        }
        if (tournamentRegistrationRepository.existsByPlayerIdAndTournamentId(
                currentUser.getId(), tournamentId)) {
            throw new ConflictException("You are already registered for this tournament");
        }

        TournamentRegistration registration = TournamentRegistration.builder()
                .player(currentUser)
                .tournament(tournament)
                .registeredAt(LocalDateTime.now())
                .build();
        tournamentRegistrationRepository.save(registration);

        tournamentStatusService.syncFullStatus(tournament);
        tournamentRepository.save(tournament);

        return tournamentMapper.toResponse(tournament, currentUser);
    }

    public TournamentResponse withdrawFromTournament(Long tournamentId, User currentUser) {
        Tournament tournament = findTournament(tournamentId);

        if (currentUser.getRole() != Role.PLAYER) {
            throw new UnauthorizedActionException("Only players can withdraw from tournaments");
        }

        TournamentRegistration registration = tournamentRegistrationRepository
                .findByPlayerIdAndTournamentId(currentUser.getId(), tournamentId)
                .orElseThrow(() -> new UnauthorizedActionException(
                        "You are not registered for this tournament"));

        tournamentRegistrationRepository.delete(registration);

        tournamentStatusService.syncFullStatus(tournament);
        tournamentRepository.save(tournament);

        return tournamentMapper.toResponse(tournament, currentUser);
    }

    public List<TournamentParticipantResponse> getParticipants(Long tournamentId) {
        return tournamentRegistrationRepository
                .findByTournamentIdOrderByRegisteredAtAsc(tournamentId)
                .stream()
                .map(reg -> TournamentParticipantResponse.builder()
                        .id(reg.getPlayer().getId())
                        .fullName(reg.getPlayer().getFirstName() + " " + reg.getPlayer().getLastName())
                        .email(reg.getPlayer().getEmail())
                        .registeredAt(reg.getRegisteredAt().toString())
                        .build())
                .toList();
    }

    public void removeParticipantByAdmin(Long tournamentId, Long playerId) {
        Tournament tournament = findTournament(tournamentId);

        TournamentRegistration registration = tournamentRegistrationRepository
                .findByPlayerIdAndTournamentId(playerId, tournamentId)
                .orElseThrow(() -> new UnauthorizedActionException(
                        "Participant is not registered in this tournament"));

        tournamentRegistrationRepository.delete(registration);

        tournamentStatusService.syncFullStatus(tournament);
        tournamentRepository.save(tournament);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Tournament findTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }
}