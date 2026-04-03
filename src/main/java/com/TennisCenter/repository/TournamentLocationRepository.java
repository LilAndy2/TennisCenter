package com.TennisCenter.repository;

import com.TennisCenter.model.TournamentLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentLocationRepository extends JpaRepository<TournamentLocation, Long> {
    List<TournamentLocation> findByTournamentId(Long tournamentId);
    void deleteByTournamentIdAndLocationId(Long tournamentId, Long locationId);
    boolean existsByTournamentIdAndLocationId(Long tournamentId, Long locationId);
}