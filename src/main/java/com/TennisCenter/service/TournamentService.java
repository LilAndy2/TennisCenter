package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.enums.TournamentLevel;
import com.TennisCenter.model.enums.TournamentStatus;
import com.TennisCenter.model.enums.TournamentSurface;
import com.TennisCenter.repository.TournamentRegistrationRepository;
import com.TennisCenter.repository.TournamentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentRegistrationRepository tournamentRegistrationRepository;

    public List<TournamentResponse> getAllTournaments(User currentUser) {
        return tournamentRepository.findAllByOrderByStartDateAsc()
                .stream()
                .map(tournament -> mapToResponse(tournament, currentUser))
                .toList();
    }

    public TournamentResponse getTournamentById(Long id, User currentUser) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        return mapToResponse(tournament, currentUser);
    }

    public List<TournamentResponse> getTournamentsByStatus(TournamentStatus status, User currentUser) {
        return tournamentRepository.findByStatusOrderByStartDateAsc(status)
                .stream()
                .map(tournament -> mapToResponse(tournament, currentUser))
                .toList();
    }

    public TournamentResponse createTournament(CreateTournamentRequest request, User currentUser) {
        Tournament tournament = Tournament.builder()
                .name(request.getName())
                .level(TournamentLevel.valueOf(request.getLevel().toUpperCase()))
                .status(TournamentStatus.UPCOMING)
                .surface(TournamentSurface.valueOf(request.getSurface().toUpperCase()))
                .startDate(LocalDate.parse(request.getStartDate()))
                .endDate(LocalDate.parse(request.getEndDate()))
                .maxPlayers(request.getMaxPlayers())
                .location(request.getLocation())
                .description(request.getDescription())
                .isFull(false)
                .createdBy(currentUser)
                .build();

        Tournament savedTournament = tournamentRepository.save(tournament);
        return mapToResponse(savedTournament, currentUser);
    }

    public TournamentResponse updateTournament(Long id, CreateTournamentRequest request, User currentUser) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        tournament.setName(request.getName());
        tournament.setLevel(TournamentLevel.valueOf(request.getLevel().toUpperCase()));
        tournament.setSurface(TournamentSurface.valueOf(request.getSurface().toUpperCase()));
        tournament.setStartDate(LocalDate.parse(request.getStartDate()));
        tournament.setEndDate(LocalDate.parse(request.getEndDate()));
        tournament.setMaxPlayers(request.getMaxPlayers());
        tournament.setLocation(request.getLocation());
        tournament.setDescription(request.getDescription());

        updateTournamentFullStatus(tournament);

        Tournament updatedTournament = tournamentRepository.save(tournament);
        return mapToResponse(updatedTournament, currentUser);
    }

    public void deleteTournament(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        tournamentRepository.delete(tournament);
    }

    public Tournament getTournamentEntityById(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    public void updateTournamentFullStatus(Tournament tournament) {
        long currentPlayers = tournamentRegistrationRepository.countByTournamentId(tournament.getId());
        tournament.setFull(currentPlayers >= tournament.getMaxPlayers());
    }

    public TournamentResponse mapToResponse(Tournament tournament, User currentUser) {
        int currentPlayers = (int) tournamentRegistrationRepository.countByTournamentId(tournament.getId());

        boolean registeredByCurrentUser = currentUser != null &&
                tournamentRegistrationRepository.existsByPlayerIdAndTournamentId(currentUser.getId(), tournament.getId());

        boolean currentUserAdmin = currentUser != null && currentUser.getRole() == Role.ADMIN;

        boolean registrationAllowedByLevel = false;

        if (currentUser != null
                && currentUser.getRole() == Role.PLAYER
                && currentUser.getPlayerLevel() != null) {
            registrationAllowedByLevel = currentUser.getPlayerLevel().ordinal() <= tournament.getLevel().ordinal();
        }

        boolean registrationOpen =
                tournament.getStatus() == TournamentStatus.UPCOMING
                        && !tournament.isFull()
                        && !currentUserAdmin
                        && registrationAllowedByLevel;

        return TournamentResponse.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .level(tournament.getLevel().getDisplayName())
                .status(tournament.getStatus().getDisplayName())
                .surface(tournament.getSurface().getDisplayName())
                .startDate(tournament.getStartDate().toString())
                .endDate(tournament.getEndDate().toString())
                .maxPlayers(tournament.getMaxPlayers())
                .currentPlayers(currentPlayers)
                .location(tournament.getLocation())
                .description(tournament.getDescription())
                .isFull(tournament.isFull())
                .registeredByCurrentUser(registeredByCurrentUser)
                .registrationOpen(registrationOpen)
                .registrationAllowedByLevel(registrationAllowedByLevel)
                .currentUserAdmin(currentUserAdmin)
                .build();
    }
}