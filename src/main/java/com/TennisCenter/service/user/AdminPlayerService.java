package com.TennisCenter.service.user;

import com.TennisCenter.dto.admin.AdminPlayerResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminPlayerService {

    private final UserRepository userRepository;

    public List<AdminPlayerResponse> getPlayersByLevel(String level, String search) {
        PlayerLevel playerLevel = PlayerLevel.valueOf(level.toUpperCase());
        String q = (search == null || search.isBlank()) ? "" : search.trim().toLowerCase();

        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.PLAYER))
                .filter(u -> u.getPlayerLevel() == playerLevel)
                .filter(u -> {
                    if (q.isEmpty()) return true;
                    String fullName = u.getFullName().toLowerCase();
                    String username = u.getDisplayUsername().toLowerCase();
                    String email = u.getEmail().toLowerCase();
                    return fullName.contains(q) || username.contains(q) || email.contains(q);
                })
                .map(this::mapToResponse)
                .toList();
    }

    public List<AdminPlayerResponse> getUmpires(String search) {
        String q = (search == null || search.isBlank()) ? "" : search.trim().toLowerCase();

        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.UMPIRE))
                .filter(u -> {
                    if (q.isEmpty()) return true;
                    String fullName = u.getFullName().toLowerCase();
                    String username = u.getDisplayUsername().toLowerCase();
                    return fullName.contains(q) || username.contains(q);
                })
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public AdminPlayerResponse changePlayerLevel(Long userId, String newLevel) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PlayerLevel level = PlayerLevel.valueOf(newLevel.toUpperCase());
        user.setPlayerLevel(level);
        userRepository.save(user);

        return mapToResponse(user);
    }

    @Transactional
    public AdminPlayerResponse addUmpireRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.getRoles().add(Role.UMPIRE);
        userRepository.save(user);

        return mapToResponse(user);
    }

    @Transactional
    public AdminPlayerResponse removeUmpireRole(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.getRoles().remove(Role.UMPIRE);
        userRepository.save(user);

        return mapToResponse(user);
    }

    /**
     * Search all players (across all levels) for the "Add umpire" dialog.
     */
    public List<AdminPlayerResponse> searchPlayersForUmpire(String search) {
        String q = (search == null || search.isBlank()) ? "" : search.trim().toLowerCase();

        return userRepository.findAll().stream()
                .filter(u -> u.getRoles().contains(Role.PLAYER))
                .filter(u -> !u.getRoles().contains(Role.UMPIRE))
                .filter(u -> {
                    if (q.isEmpty()) return true;
                    String fullName = u.getFullName().toLowerCase();
                    String username = u.getDisplayUsername().toLowerCase();
                    return fullName.contains(q) || username.contains(q);
                })
                .limit(20)
                .map(this::mapToResponse)
                .toList();
    }

    private AdminPlayerResponse mapToResponse(User user) {
        return AdminPlayerResponse.builder()
                .id(user.getId())
                .username(user.getDisplayUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .playerLevel(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : null)
                .roles(user.getRoles().stream().map(Role::name).toList())
                .wins(user.getWins() != null ? user.getWins() : 0)
                .losses(user.getLosses() != null ? user.getLosses() : 0)
                .rankingPoints(user.getRankingPoints() != null ? user.getRankingPoints() : 0)
                .build();
    }
}