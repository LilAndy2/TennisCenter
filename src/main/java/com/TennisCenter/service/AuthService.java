package com.TennisCenter.service;

import com.TennisCenter.config.JwtService;
import com.TennisCenter.dto.auth.AuthResponse;
import com.TennisCenter.dto.auth.LoginRequest;
import com.TennisCenter.dto.auth.RegisterRequest;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already in use");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.PLAYER)
                .playerLevel(PlayerLevel.valueOf(request.getPlayerLevel().toUpperCase()))
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .playerLevel(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : null)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getDisplayUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .playerLevel(user.getPlayerLevel() != null ? user.getPlayerLevel().getDisplayName() : null)
                .build();
    }
}
