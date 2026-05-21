package com.TennisCenter.repository;

import com.TennisCenter.model.MatchPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MatchPointRepository extends JpaRepository<MatchPoint, Long> {

    List<MatchPoint> findByMatchIdOrderByPointNumberAsc(Long matchId);

    Optional<MatchPoint> findTopByMatchIdOrderByPointNumberDesc(Long matchId);

    void deleteByMatchIdAndPointNumber(Long matchId, Integer pointNumber);

    long countByMatchId(Long matchId);

    boolean existsByMatchId(Long matchId);

    @Query("SELECT mp FROM MatchPoint mp WHERE mp.match.id = :matchId ORDER BY mp.pointNumber DESC LIMIT 1")
    Optional<MatchPoint> findLastPoint(@Param("matchId") Long matchId);

    List<MatchPoint> findByPointWinnerIdOrderByRecordedAtAsc(Long playerId);

    @Query("SELECT mp FROM MatchPoint mp WHERE mp.match.id IN :matchIds ORDER BY mp.match.id, mp.pointNumber ASC")
    List<MatchPoint> findByMatchIdInOrderByMatchIdAscPointNumberAsc(@Param("matchIds") List<Long> matchIds);
}