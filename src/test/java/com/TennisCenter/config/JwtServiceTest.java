package com.TennisCenter.config;

import com.TennisCenter.model.User;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;
    private User user;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Must be at least 32 chars for HMAC-SHA256
        ReflectionTestUtils.setField(jwtService, "secretKey",
                "test-secret-key-that-is-at-least-32-characters-long-for-hmac");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L);

        user = TestDataFactory.player();
    }

    @Test
    void generateToken_shouldReturnNonEmptyString() {
        String token = jwtService.generateToken(user);

        assertThat(token).isNotBlank();
    }

    @Test
    void extractUsername_shouldReturnEmail() {
        // User.getUsername() returns email (overridden for Spring Security)
        String token = jwtService.generateToken(user);

        String extracted = jwtService.extractUsername(token);

        assertThat(extracted).isEqualTo(user.getEmail());
    }

    @Test
    void isTokenValid_shouldReturnTrueForValidToken() {
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void isTokenValid_shouldReturnFalseForDifferentUser() {
        String token = jwtService.generateToken(user);
        User otherUser = TestDataFactory.player(2L, "other", "other@test.com");

        assertThat(jwtService.isTokenValid(token, otherUser)).isFalse();
    }

    @Test
    void isTokenValid_shouldReturnFalseForExpiredToken() {
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1L);
        String token = jwtService.generateToken(user);

        assertThatThrownBy(() -> jwtService.isTokenValid(token, user))
                .isInstanceOf(io.jsonwebtoken.ExpiredJwtException.class);
    }

    @Test
    void extractClaim_shouldReturnRolesClaim() {
        String token = jwtService.generateToken(user);

        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) jwtService.extractClaim(token, claims -> claims.get("roles", List.class));

        assertThat(roles).contains("PLAYER");
    }

    @Test
    void extractClaim_shouldReturnUserIdClaim() {
        String token = jwtService.generateToken(user);

        Long userId = jwtService.extractClaim(token, claims -> claims.get("userId", Long.class));

        assertThat(userId).isEqualTo(user.getId());
    }
}