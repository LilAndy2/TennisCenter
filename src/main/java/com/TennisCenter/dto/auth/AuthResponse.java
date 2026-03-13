package com.TennisCenter.dto.auth;

import com.TennisCenter.model.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String username;
    private String email;
    private Role role;
}
