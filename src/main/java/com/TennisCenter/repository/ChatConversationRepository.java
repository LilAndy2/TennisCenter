package com.TennisCenter.repository;

import com.TennisCenter.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    @Query("""
            SELECT c FROM ChatConversation c
            WHERE c.participantOne.id = :userId OR c.participantTwo.id = :userId
            ORDER BY c.lastMessageAt DESC NULLS LAST
            """)
    List<ChatConversation> findAllByUserId(@Param("userId") Long userId);

    @Query("""
            SELECT c FROM ChatConversation c
            WHERE (c.participantOne.id = :userOneId AND c.participantTwo.id = :userTwoId)
               OR (c.participantOne.id = :userTwoId AND c.participantTwo.id = :userOneId)
            """)
    Optional<ChatConversation> findByParticipants(
            @Param("userOneId") Long userOneId,
            @Param("userTwoId") Long userTwoId
    );
}