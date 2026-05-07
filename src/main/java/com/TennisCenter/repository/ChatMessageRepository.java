package com.TennisCenter.repository;

import com.TennisCenter.model.ChatMessage;
import com.TennisCenter.model.enums.ChatMessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Page<ChatMessage> findByConversationIdOrderBySentAtDesc(Long conversationId, Pageable pageable);

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE m.conversation.id = :conversationId
              AND m.sender.id != :userId
              AND m.status != 'READ'
            """)
    long countUnreadInConversation(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId
    );

    @Query("""
            SELECT COUNT(m) FROM ChatMessage m
            WHERE m.sender.id != :userId
              AND m.status != 'READ'
              AND (m.conversation.participantOne.id = :userId
                   OR m.conversation.participantTwo.id = :userId)
            """)
    long countTotalUnread(@Param("userId") Long userId);

    @Modifying
    @Query("""
            UPDATE ChatMessage m SET m.status = :status
            WHERE m.conversation.id = :conversationId
              AND m.sender.id != :userId
              AND m.status != 'READ'
            """)
    void markMessagesAsRead(
            @Param("conversationId") Long conversationId,
            @Param("userId") Long userId,
            @Param("status") ChatMessageStatus status
    );
}