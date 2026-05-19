package com.TennisCenter.dto.auth;

import com.TennisCenter.model.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private List<Role> roles;
    private String playerLevel;
    private String profileImageUrl;

    /**
     * @deprecated Use {@link #getRoles()} instead. Kept for backward compatibility.
     */
    @Deprecated
    public Role getRole() {
        if (roles == null || roles.isEmpty()) return null;
        // Return highest-priority role for legacy consumers
        if (roles.contains(Role.ADMIN)) return Role.ADMIN;
        if (roles.contains(Role.PLAYER)) return Role.PLAYER;
        return roles.get(0);
    }
}
