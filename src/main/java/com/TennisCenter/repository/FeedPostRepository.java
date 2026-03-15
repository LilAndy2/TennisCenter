package com.TennisCenter.repository;

import com.TennisCenter.model.FeedPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedPostRepository extends JpaRepository<FeedPost, Long> {
    List<FeedPost> findAllByOrderByCreatedAtDesc();
}
