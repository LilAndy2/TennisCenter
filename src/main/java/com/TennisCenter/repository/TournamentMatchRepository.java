package com.TennisCenter.repository;

import com.TennisCenter.model.TournamentMatch;
import com.TennisCenter.model.enums.TournamentMatchPhase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TournamentMatchRepository extends JpaRepository<TournamentMatch, Long> {
    List<TournamentMatch> findByTournamentIdOrderByPhaseAscRoundNumberAscMatchOrderAsc(Long tournamentId);
    List<TournamentMatch> findByTournamentIdAndPhaseOrderByGroupNameAscMatchOrderAsc(
            Long tournamentId,
            TournamentMatchPhase phase
    );
    List<TournamentMatch> findByPlayerOneIdOrPlayerTwoId(Long playerOneId, Long playerTwoId);
    List<TournamentMatch> findByMatchDateAndPlayerOneIdOrMatchDateAndPlayerTwoId(
            LocalDate date1,
            Long playerOneId,
            LocalDate date2,
            Long playerTwoId
    );
}
