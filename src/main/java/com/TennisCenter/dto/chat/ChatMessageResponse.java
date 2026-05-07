package com.TennisCenter.dto.chat;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChatMessageResponse {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderProfileImageUrl;
    private String content;
    private LocalDateTime sentAt;
    private String status;
}