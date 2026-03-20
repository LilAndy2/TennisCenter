package com.TennisCenter.repository;

import com.TennisCenter.model.Tournament;
import com.TennisCenter.model.enums.TournamentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findAllByOrderByStartDateAsc();
    List<Tournament> findByStatusOrderByStartDateAsc(TournamentStatus status);
}
