package com.TennisCenter.repository;

import com.TennisCenter.model.TournamentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Long> {
    boolean existsByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
    long countByTournamentId(Long tournamentId);
    List<TournamentRegistration> findByTournamentIdOrderByRegisteredAtAsc(Long tournamentId);
    Optional<TournamentRegistration> findByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
}
