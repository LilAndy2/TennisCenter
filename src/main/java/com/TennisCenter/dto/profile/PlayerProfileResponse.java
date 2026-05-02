package com.TennisCenter.dto.profile;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PlayerProfileResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String playerLevel;
    private Integer rankingPoints;
    private Integer wins;
    private Integer losses;
    private Double winRate;
    private Integer rank;
    private String profileImageUrl;
    private String bio;
    private Integer titlesCount;
    private Integer finalsCount;
}
