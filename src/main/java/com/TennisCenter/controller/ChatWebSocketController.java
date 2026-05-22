package com.TennisCenter.controller;

import com.TennisCenter.dto.chat.ChatMessageResponse;
import com.TennisCenter.dto.chat.SendMessageRequest;
import com.TennisCenter.model.User;
import com.TennisCenter.service.social.ChatService;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        User sender = extractUser(principal);

        ChatMessageResponse response = chatService.sendMessage(sender.getId(), request);

        // Send to the recipient's topic
        messagingTemplate.convertAndSend(
                "/topic/chat.user." + request.getRecipientId(),
                response
        );

        // Also send back to sender (for multi-tab / confirmation)
        messagingTemplate.convertAndSend(
                "/topic/chat.user." + sender.getId(),
                response
        );

        log.info("Message sent from {} to {}", sender.getId(), request.getRecipientId());
    }

    @MessageMapping("/chat.read")
    public void markAsRead(@Payload ReadReceiptRequest request, Principal principal) {
        User reader = extractUser(principal);
        chatService.markAsRead(request.getConversationId(), reader.getId());

        // Notify the other participant about read receipt
        messagingTemplate.convertAndSend(
                "/topic/chat.read." + request.getOtherUserId(),
                new ReadReceiptNotification(request.getConversationId(), reader.getId())
        );
    }

    private User extractUser(Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            return (User) auth.getPrincipal();
        }
        throw new RuntimeException("User not authenticated via WebSocket");
    }

    @Data
    public static class ReadReceiptRequest {
        private Long conversationId;
        private Long otherUserId;
    }

    @Data
    @AllArgsConstructor
    public static class ReadReceiptNotification {
        private Long conversationId;
        private Long readByUserId;
    }
}