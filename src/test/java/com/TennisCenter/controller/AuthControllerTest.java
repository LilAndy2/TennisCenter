package com.TennisCenter.controller;

import com.TennisCenter.dto.auth.AuthResponse;
import com.TennisCenter.dto.auth.LoginRequest;
import com.TennisCenter.dto.auth.RegisterRequest;
import com.TennisCenter.exception.ConflictException;
import com.TennisCenter.model.enums.Role;
import com.TennisCenter.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private AuthService authService;

    @Test
    void register_shouldReturn200WithToken() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUsername("johndoe");
        request.setEmail("john@test.com");
        request.setPassword("password123");
        request.setPlayerLevel("MEDIUM");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .id(1L)
                .username("johndoe")
                .email("john@test.com")
                .role(Role.PLAYER)
                .playerLevel("Medium")
                .build();

        when(authService.register(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"John\",\"lastName\":\"Doe\",\"username\":\"johndoe\",\"email\":\"john@test.com\",\"password\":\"password123\",\"playerLevel\":\"MEDIUM\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"))
                .andExpect(jsonPath("$.email").value("john@test.com"))
                .andExpect(jsonPath("$.role").value("PLAYER"));
    }

    @Test
    void register_shouldReturn409WhenEmailConflict() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setUsername("johndoe");
        request.setEmail("existing@test.com");
        request.setPassword("password123");
        request.setPlayerLevel("MEDIUM");

        when(authService.register(any()))
                .thenThrow(new ConflictException("Email already in use"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"firstName\":\"John\",\"lastName\":\"Doe\",\"username\":\"johndoe\",\"email\":\"existing@test.com\",\"password\":\"password123\",\"playerLevel\":\"MEDIUM\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void login_shouldReturn200WithToken() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@test.com");
        request.setPassword("password123");

        AuthResponse response = AuthResponse.builder()
                .token("jwt-token")
                .id(1L)
                .username("johndoe")
                .email("john@test.com")
                .role(Role.PLAYER)
                .build();

        when(authService.login(any())).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"john@test.com\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt-token"));
    }
}