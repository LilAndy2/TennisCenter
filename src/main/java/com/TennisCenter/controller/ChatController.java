package com.TennisCenter.controller;

import com.TennisCenter.dto.chat.*;
import com.TennisCenter.model.User;
import com.TennisCenter.service.social.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public List<ChatConversationResponse> getConversations(@AuthenticationPrincipal User user) {
        return chatService.getConversations(user.getId());
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public Page<ChatMessageResponse> getMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size
    ) {
        return chatService.getMessages(conversationId, user.getId(), page, size);
    }

    @PostMapping("/conversations/{conversationId}/read")
    public void markAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal User user
    ) {
        chatService.markAsRead(conversationId, user.getId());
    }

    @GetMapping("/unread-count")
    public long getUnreadCount(@AuthenticationPrincipal User user) {
        return chatService.getUnreadCount(user.getId());
    }

    @GetMapping("/users/search")
    public List<ChatUserSearchResponse> searchUsers(
            @RequestParam String query,
            @AuthenticationPrincipal User user
    ) {
        return chatService.searchUsers(query, user.getId());
    }

    @PostMapping("/conversations/with/{otherUserId}")
    public Long getOrCreateConversation(
            @PathVariable Long otherUserId,
            @AuthenticationPrincipal User user
    ) {
        return chatService.getOrCreateConversation(user.getId(), otherUserId);
    }
}