package com.TennisCenter.repository;

import com.TennisCenter.model.MatchSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MatchSetRepository extends JpaRepository<MatchSet, Long> {
    List<MatchSet> findByMatchIdOrderBySetNumberAsc(Long matchId);
    void deleteByMatchId(Long matchId);
}
