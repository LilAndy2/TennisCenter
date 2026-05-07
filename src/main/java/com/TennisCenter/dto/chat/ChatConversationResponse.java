package com.TennisCenter.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatConversationResponse {
    private Long id;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserUsername;
    private String otherUserProfileImageUrl;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private long unreadCount;
}