package com.TennisCenter.service;

import com.TennisCenter.model.User;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * One-time migration: populates the new 'user_roles' join table
 * from the legacy 'role' column for all existing users.
 * Safe to run multiple times — skips users that already have roles populated.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserRolesMigration {

    private final UserRepository userRepository;

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void migrateRoles() {
        List<User> allUsers = userRepository.findAll();
        int migrated = 0;

        for (User user : allUsers) {
            if (user.getRoles() == null || user.getRoles().isEmpty()) {
                user.getRoles().add(user.getRole());
                userRepository.save(user);
                migrated++;
            }
        }

        if (migrated > 0) {
            log.info("UserRolesMigration: populated user_roles for {} users from legacy role column", migrated);
        } else {
            log.info("UserRolesMigration: all users already have roles populated, nothing to migrate");
        }
    }
}