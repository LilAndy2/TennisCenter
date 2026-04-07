package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.ValidationException;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.*;
import com.TennisCenter.repository.LocationRepository;
import com.TennisCenter.repository.TournamentLocationRepository;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.service.tournament.TournamentMapper;
import com.TennisCenter.service.tournament.TournamentStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;
    private final TournamentLocationRepository tournamentLocationRepository;
    private final LocationRepository locationRepository;
    private final TournamentMapper tournamentMapper;
    private final TournamentStatusService tournamentStatusService;

    public List<TournamentResponse> getAllTournaments(User currentUser) {
        List<Tournament> tournaments = tournamentRepository.findAllByOrderByStartDateAsc();
        tournaments.forEach(tournamentStatusService::syncWithDates);
        tournamentRepository.saveAll(tournaments);
        return tournaments.stream()
                .map(t -> tournamentMapper.toResponse(t, currentUser))
                .toList();
    }

    public TournamentResponse getTournamentById(Long id, User currentUser) {
        Tournament tournament = findTournament(id);
        tournamentStatusService.syncWithDates(tournament);
        tournamentRepository.save(tournament);
        return tournamentMapper.toResponse(tournament, currentUser);
    }

    public List<TournamentResponse> getTournamentsByStatus(
            TournamentStatus status, User currentUser) {

        List<Tournament> allTournaments = tournamentRepository.findAllByOrderByStartDateAsc();
        allTournaments.forEach(tournamentStatusService::syncWithDates);
        tournamentRepository.saveAll(allTournaments);

        return allTournaments.stream()
                .filter(t -> t.getStatus() == status)
                .map(t -> tournamentMapper.toResponse(t, currentUser))
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
                .description(request.getDescription())
                .isFull(false)
                .createdBy(currentUser)
                .bracketType(TournamentBracketType.valueOf(request.getBracketType().toUpperCase()))
                .build();

        Tournament saved = tournamentRepository.save(tournament);
        attachLocations(saved, request.getLocationIds());

        return tournamentMapper.toResponse(saved, currentUser);
    }

    public TournamentResponse updateTournament(
            Long id, CreateTournamentRequest request, User currentUser) {

        Tournament tournament = findTournament(id);

        tournament.setName(request.getName());
        tournament.setLevel(TournamentLevel.valueOf(request.getLevel().toUpperCase()));
        tournament.setSurface(TournamentSurface.valueOf(request.getSurface().toUpperCase()));
        tournament.setStartDate(LocalDate.parse(request.getStartDate()));
        tournament.setEndDate(LocalDate.parse(request.getEndDate()));
        tournament.setMaxPlayers(request.getMaxPlayers());
        tournament.setDescription(request.getDescription());
        tournament.setBracketType(
                TournamentBracketType.valueOf(request.getBracketType().toUpperCase()));

        tournamentStatusService.syncFullStatus(tournament);

        Tournament updated = tournamentRepository.save(tournament);

        tournamentLocationRepository.deleteAll(
                tournamentLocationRepository.findByTournamentId(tournament.getId()));
        attachLocations(updated, request.getLocationIds());

        return tournamentMapper.toResponse(updated, currentUser);
    }

    public void deleteTournament(Long id) {
        Tournament tournament = findTournament(id);
        tournamentRepository.delete(tournament);
    }

    public TournamentResponse startTournament(Long id, User currentUser) {
        Tournament tournament = findTournament(id);

        if (tournament.getStatus() != TournamentStatus.UPCOMING) {
            throw new ValidationException("Only upcoming tournaments can be started");
        }

        tournament.setStatus(TournamentStatus.ONGOING);
        return tournamentMapper.toResponse(tournamentRepository.save(tournament), currentUser);
    }

    public TournamentResponse finishTournament(Long id, User currentUser) {
        Tournament tournament = findTournament(id);

        if (tournament.getStatus() != TournamentStatus.ONGOING) {
            throw new ValidationException("Only ongoing tournaments can be finished");
        }

        tournament.setStatus(TournamentStatus.FINISHED);
        return tournamentMapper.toResponse(tournamentRepository.save(tournament), currentUser);
    }

    public Tournament getTournamentEntityById(Long id) {
        return findTournament(id);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Tournament findTournament(Long id) {
        return tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));
    }

    private void attachLocations(Tournament tournament, List<Long> locationIds) {
        if (locationIds == null) return;
        for (Long locationId : locationIds) {
            locationRepository.findById(locationId).ifPresent(location -> {
                TournamentLocation tl = TournamentLocation.builder()
                        .tournament(tournament)
                        .location(location)
                        .build();
                tournamentLocationRepository.save(tl);
            });
        }
    }
}