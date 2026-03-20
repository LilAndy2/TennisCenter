package com.TennisCenter.repository;

import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    java.util.Optional<User> findByEmail(String email);

    @Query("""
            SELECT u
            FROM User u
            WHERE u.role = :role
              AND u.playerLevel = :playerLevel
              AND (
                    LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<User> searchLeaderboardPlayers(
            @Param("role") Role role,
            @Param("playerLevel") PlayerLevel playerLevel,
            @Param("search") String search,
            Pageable pageable
    );
}