package com.TennisCenter.repository;

import com.TennisCenter.model.RankingPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RankingPointRepository extends JpaRepository<RankingPoint, Long> {

    List<RankingPoint> findByUserId(Long userId);

    List<RankingPoint> findByMatchId(Long matchId);

    void deleteByMatchId(Long matchId);

    @Query("SELECT COALESCE(SUM(rp.points), 0) FROM RankingPoint rp " +
            "WHERE rp.user.id = :userId AND rp.expiryDate > :today")
    Integer sumActivePointsByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT COUNT(rp) FROM RankingPoint rp " +
            "WHERE rp.user.id = :userId AND rp.win = true")
    Integer countWinsByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(rp) FROM RankingPoint rp " +
            "WHERE rp.user.id = :userId AND rp.win = false")
    Integer countLossesByUserId(@Param("userId") Long userId);

    List<RankingPoint> findByExpiryDateLessThanEqual(LocalDate date);
}