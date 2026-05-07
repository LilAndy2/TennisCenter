package com.TennisCenter.service;

import com.TennisCenter.dto.chat.*;
import com.TennisCenter.model.*;
import com.TennisCenter.model.enums.ChatMessageStatus;
import com.TennisCenter.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;

    public List<ChatConversationResponse> getConversations(Long userId) {
        List<ChatConversation> conversations = conversationRepository.findAllByUserId(userId);

        return conversations.stream().map(conv -> {
            User other = conv.getParticipantOne().getId().equals(userId)
                    ? conv.getParticipantTwo()
                    : conv.getParticipantOne();

            String profileImageUrl = playerProfileRepository.findByUserId(other.getId())
                    .map(PlayerProfile::getProfileImageUrl)
                    .orElse(null);

            long unread = messageRepository.countUnreadInConversation(conv.getId(), userId);

            return ChatConversationResponse.builder()
                    .id(conv.getId())
                    .otherUserId(other.getId())
                    .otherUserName(other.getFirstName() + " " + other.getLastName())
                    .otherUserUsername(other.getDisplayUsername())
                    .otherUserProfileImageUrl(profileImageUrl)
                    .lastMessage(conv.getLastMessageContent())
                    .lastMessageAt(conv.getLastMessageAt())
                    .unreadCount(unread)
                    .build();
        }).toList();
    }

    public Page<ChatMessageResponse> getMessages(Long conversationId, Long userId, int page, int size) {
        ChatConversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        // Verify user is participant
        if (!conv.getParticipantOne().getId().equals(userId)
                && !conv.getParticipantTwo().getId().equals(userId)) {
            throw new RuntimeException("You are not a participant in this conversation");
        }

        return messageRepository
                .findByConversationIdOrderBySentAtDesc(conversationId, PageRequest.of(page, size))
                .map(this::toMessageResponse);
    }

    @Transactional
    public ChatMessageResponse sendMessage(Long senderId, SendMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        User recipient = userRepository.findById(request.getRecipientId())
                .orElseThrow(() -> new RuntimeException("Recipient not found"));

        // Find or create conversation
        ChatConversation conversation = conversationRepository
                .findByParticipants(senderId, request.getRecipientId())
                .orElseGet(() -> {
                    ChatConversation newConv = ChatConversation.builder()
                            .participantOne(sender)
                            .participantTwo(recipient)
                            .build();
                    return conversationRepository.save(newConv);
                });

        // Create message
        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .sentAt(LocalDateTime.now())
                .status(ChatMessageStatus.SENT)
                .build();

        messageRepository.save(message);

        // Update conversation metadata
        conversation.setLastMessageAt(message.getSentAt());
        conversation.setLastMessageContent(
                message.getContent().length() > 100
                        ? message.getContent().substring(0, 100) + "..."
                        : message.getContent()
        );
        conversationRepository.save(conversation);

        return toMessageResponse(message);
    }

    @Transactional
    public void markAsRead(Long conversationId, Long userId) {
        messageRepository.markMessagesAsRead(conversationId, userId, ChatMessageStatus.READ);
    }

    public long getUnreadCount(Long userId) {
        return messageRepository.countTotalUnread(userId);
    }

    public List<ChatUserSearchResponse> searchUsers(String query, Long currentUserId) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }

        String search = query.trim().toLowerCase();

        return userRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentUserId))
                .filter(u -> {
                    String fullName = (u.getFirstName() + " " + u.getLastName()).toLowerCase();
                    String username = u.getDisplayUsername().toLowerCase();
                    return fullName.contains(search) || username.contains(search);
                })
                .limit(20)
                .map(u -> {
                    String profileImageUrl = playerProfileRepository.findByUserId(u.getId())
                            .map(PlayerProfile::getProfileImageUrl)
                            .orElse(null);

                    return ChatUserSearchResponse.builder()
                            .id(u.getId())
                            .fullName(u.getFirstName() + " " + u.getLastName())
                            .username(u.getDisplayUsername())
                            .profileImageUrl(profileImageUrl)
                            .playerLevel(u.getPlayerLevel() != null
                                    ? u.getPlayerLevel().getDisplayName() : null)
                            .build();
                })
                .toList();
    }

    /**
     * Get or create a conversation between two users. Returns the conversation ID.
     */
    @Transactional
    public Long getOrCreateConversation(Long userId, Long otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User other = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatConversation conversation = conversationRepository
                .findByParticipants(userId, otherUserId)
                .orElseGet(() -> {
                    ChatConversation newConv = ChatConversation.builder()
                            .participantOne(user)
                            .participantTwo(other)
                            .build();
                    return conversationRepository.save(newConv);
                });

        return conversation.getId();
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        String profileImageUrl = playerProfileRepository
                .findByUserId(message.getSender().getId())
                .map(PlayerProfile::getProfileImageUrl)
                .orElse(null);

        return ChatMessageResponse.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFirstName() + " " + message.getSender().getLastName())
                .senderProfileImageUrl(profileImageUrl)
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .status(message.getStatus().name())
                .build();
    }
}