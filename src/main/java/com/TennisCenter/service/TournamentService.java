package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.LocationRepository;
import com.TennisCenter.repository.TournamentLocationRepository;
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
    private final TournamentLocationRepository tournamentLocationRepository;
    private final LocationRepository locationRepository;

    public List<TournamentResponse> getAllTournaments(User currentUser) {
        List<Tournament> tournaments = tournamentRepository.findAllByOrderByStartDateAsc();

        tournaments.forEach(this::syncTournamentStatusWithDates);
        tournamentRepository.saveAll(tournaments);

        return tournaments
                .stream()
                .map(tournament -> mapToResponse(tournament, currentUser))
                .toList();
    }

    public TournamentResponse getTournamentById(Long id, User currentUser) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        syncTournamentStatusWithDates(tournament);
        tournamentRepository.save(tournament);

        return mapToResponse(tournament, currentUser);
    }

    public List<TournamentResponse> getTournamentsByStatus(TournamentStatus status, User currentUser) {
        List<Tournament> allTournaments = tournamentRepository.findAllByOrderByStartDateAsc();

        allTournaments.forEach(this::syncTournamentStatusWithDates);
        tournamentRepository.saveAll(allTournaments);

        return allTournaments.stream()
                .filter(tournament -> tournament.getStatus() == status)
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
                .bracketType(TournamentBracketType.valueOf(request.getBracketType().toUpperCase()))
                .build();

        Tournament savedTournament = tournamentRepository.save(tournament);

        if (request.getLocationIds() != null) {
            for (Long locationId : request.getLocationIds()) {
                locationRepository.findById(locationId).ifPresent(location -> {
                    TournamentLocation tl = TournamentLocation.builder()
                            .tournament(savedTournament)
                            .location(location)
                            .build();
                    tournamentLocationRepository.save(tl);
                });
            }
        }

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
        tournament.setBracketType(TournamentBracketType.valueOf(request.getBracketType().toUpperCase()));

        updateTournamentFullStatus(tournament);

        Tournament updatedTournament = tournamentRepository.save(tournament);

        tournamentLocationRepository.deleteAll(
                tournamentLocationRepository.findByTournamentId(tournament.getId())
        );

        if (request.getLocationIds() != null) {
            for (Long locationId : request.getLocationIds()) {
                locationRepository.findById(locationId).ifPresent(location -> {
                    TournamentLocation tl = TournamentLocation.builder()
                            .tournament(tournament)
                            .location(location)
                            .build();
                    tournamentLocationRepository.save(tl);
                });
            }
        }

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

    public TournamentResponse startTournament(Long id, User currentUser) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new IllegalStateException("Only upcoming tournaments can be started");
        }

        tournament.setStatus(TournamentStatus.ONGOING);

        Tournament updatedTournament = tournamentRepository.save(tournament);
        return mapToResponse(updatedTournament, currentUser);
    }

    public TournamentResponse finishTournament(Long id, User currentUser) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        if (tournament.getStatus() != TournamentStatus.ONGOING) {
            throw new IllegalStateException("Only ongoing tournaments can be finished");
        }

        tournament.setStatus(TournamentStatus.FINISHED);

        Tournament updatedTournament = tournamentRepository.save(tournament);
        return mapToResponse(updatedTournament, currentUser);
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
                .bracketType(tournament.getBracketType().getDisplayName())
                .locationIds(
                        tournamentLocationRepository.findByTournamentId(tournament.getId())
                                .stream()
                                .map(tl -> tl.getLocation().getId())
                                .toList()
                )
                .build();
    }

    private void syncTournamentStatusWithDates(Tournament tournament) {
        LocalDate today = LocalDate.now();

        if (tournament.getStatus() == TournamentStatus.FINISHED) {
            return;
        }

        if (today.isAfter(tournament.getEndDate())) {
            tournament.setStatus(TournamentStatus.FINISHED);
        } else if (
                (today.isEqual(tournament.getStartDate()) || today.isAfter(tournament.getStartDate()))
                    && today.isBefore(tournament.getEndDate().plusDays(1))
                    && tournament.getStatus() == TournamentStatus.UPCOMING
        ) {
            tournament.setStatus(TournamentStatus.ONGOING);
        }
    }
}