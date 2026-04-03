package com.TennisCenter.repository;

import com.TennisCenter.model.Court;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByLocationIdOrderByCourtNumberAsc(Long locationId);
}