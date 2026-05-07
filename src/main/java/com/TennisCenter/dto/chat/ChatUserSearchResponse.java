package com.TennisCenter.dto.chat;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatUserSearchResponse {
    private Long id;
    private String fullName;
    private String username;
    private String profileImageUrl;
    private String playerLevel;
}