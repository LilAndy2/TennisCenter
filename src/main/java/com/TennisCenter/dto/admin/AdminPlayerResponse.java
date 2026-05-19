package com.TennisCenter.dto.admin;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminPlayerResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String playerLevel;
    private List<String> roles;
    private Integer wins;
    private Integer losses;
    private Integer rankingPoints;
}