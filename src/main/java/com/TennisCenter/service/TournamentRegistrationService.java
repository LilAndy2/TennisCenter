package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.TournamentParticipantResponse;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.*;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TournamentRegistrationService {

    private final TournamentRegistrationRepository tournamentRegistrationRepository;
    private final TournamentRepository tournamentRepository;
    private final TournamentService tournamentService;

    public TournamentResponse registerToTournament(Long tournamentId, User currentUser) {
        Tournament tournament = tournamentRepository.findById(tournamentId)
                .orElseThrow(() -> new RuntimeException("Tournament not found"));

        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new UnauthorizedActionException("You can register only for upcoming tournaments");
        }

        if (tournament.isFull()) {
            throw new UnauthorizedActionException("This tournament is already full");
        }

        boolean alreadyRegistered = tournamentRegistrationRepository
                .existsByPlayerIdAndTournamentId(currentUser.getId(), tournamentId);

        if (alreadyRegistered) {
            throw new UnauthorizedActionException("You are already registered for this tournament");
        }

        TournamentRegistration registration = TournamentRegistration.builder()
                .player(currentUser)
                .tournament(tournament)
                .registeredAt(LocalDateTime.now())
                .build();

        tournamentRegistrationRepository.save(registration);

        tournamentService.updateTournamentFullStatus(tournament);
        tournamentRepository.save(tournament);

        return tournamentService.mapToResponse(tournament, currentUser);
    }

    public List<TournamentParticipantResponse> getParticipants(Long tournamentId) {
        return tournamentRegistrationRepository.findByTournamentIdOrderByRegisteredAtAsc(tournamentId)
                .stream()
                .map(registration -> TournamentParticipantResponse.builder()
                        .id(registration.getPlayer().getId())
                        .fullName(
                                registration.getPlayer().getFirstName() + " " +
                                        registration.getPlayer().getLastName()
                        )
                        .email(registration.getPlayer().getEmail())
                        .registeredAt(registration.getRegisteredAt().toString())
                        .build())
                .toList();
    }
}
