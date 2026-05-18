package com.TennisCenter.service;

import com.TennisCenter.config.JwtService;
import com.TennisCenter.dto.auth.AuthResponse;
import com.TennisCenter.dto.auth.LoginRequest;
import com.TennisCenter.dto.auth.RegisterRequest;
import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.PlayerLevel;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.repository.PlayerProfileRepository;
import com.TennisCenter.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private PlayerProfileRepository playerProfileRepository;

    @InjectMocks private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFirstName("John");
        registerRequest.setLastName("Doe");
        registerRequest.setUsername("johndoe");
        registerRequest.setEmail("john@test.com");
        registerRequest.setPassword("password123");
        registerRequest.setPlayerLevel("MEDIUM");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("password123");
    }

    @Test
    void register_shouldCreateUserAndReturnToken() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPwd");
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(registerRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("john@test.com");

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());

        User saved = captor.getValue();
        assertThat(saved.getRole()).isEqualTo(Role.PLAYER);
        assertThat(saved.getPlayerLevel()).isEqualTo(PlayerLevel.MEDIUM);
        assertThat(saved.getPassword()).isEqualTo("encodedPwd");
    }

    @Test
    void register_shouldThrowWhenEmailAlreadyExists() {
        when(userRepository.existsByEmail("john@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldThrowWhenUsernameAlreadyExists() {
        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Username is already in use");
    }

    @Test
    void login_shouldAuthenticateAndReturnToken() {
        User user = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .username("johndoe")
                .email("john@test.com")
                .password("encodedPwd")
                .role(Role.PLAYER)
                .playerLevel(PlayerLevel.MEDIUM)
                .rankingPoints(0).wins(0).losses(0)
                .build();

        when(userRepository.findByEmail("john@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(playerProfileRepository.findByUserId(1L)).thenReturn(Optional.empty());

        AuthResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUsername()).isEqualTo("johndoe");
        assertThat(response.getRole()).isEqualTo(Role.PLAYER);

        verify(authenticationManager).authenticate(
                any(UsernamePasswordAuthenticationToken.class));
    }
}