package com.TennisCenter.repository;

import com.TennisCenter.model.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByOrderBySubmittedAtDesc();
    List<Feedback> findByUserIdOrderBySubmittedAtDesc(Long userId);
}