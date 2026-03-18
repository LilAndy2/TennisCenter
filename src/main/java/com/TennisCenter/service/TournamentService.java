package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.CreateTournamentRequest;
import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.TournamentLevel;
import com.TennisCenter.model.TournamentStatus;
import com.TennisCenter.model.TournamentSurface;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.model.Tournament;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TournamentService {

    private final TournamentRepository tournamentRepository;

    public List<TournamentResponse> getAllTournaments() {
        return tournamentRepository.findAllByOrderByStartDateAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TournamentResponse getTournamentById(Long id) {
        Tournament tournament = tournamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tournament not found"));

        return mapToResponse(tournament);
    }

    public List<TournamentResponse> getTournamentsByStatus(TournamentStatus status) {
        return tournamentRepository.findByStatusOrderByStartDateAsc(status)
                .stream()
                .map(this::mapToResponse)
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
        return mapToResponse(savedTournament);
    }

    private TournamentResponse mapToResponse(Tournament tournament) {
        return TournamentResponse.builder()
                .id(tournament.getId())
                .name(tournament.getName())
                .level(tournament.getLevel().getDisplayName())
                .status(tournament.getStatus().getDisplayName())
                .surface(tournament.getSurface().getDisplayName())
                .startDate(tournament.getStartDate().toString())
                .endDate(tournament.getEndDate().toString())
                .maxPlayers(tournament.getMaxPlayers())
                .location(tournament.getLocation())
                .description(tournament.getDescription())
                .isFull(tournament.isFull())
                .build();
    }
}
