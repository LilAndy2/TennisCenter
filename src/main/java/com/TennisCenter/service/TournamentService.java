package com.TennisCenter.service;

import com.TennisCenter.dto.tournament.TournamentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.repository.TournamentRepository;
import com.TennisCenter.model.Tournament;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
