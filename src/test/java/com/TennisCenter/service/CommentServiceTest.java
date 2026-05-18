package com.TennisCenter.service;

import com.TennisCenter.dto.feed.CommentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.Comment;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.CommentRepository;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CommentServiceTest {

    @Mock private CommentRepository commentRepository;
    @Mock private FeedPostRepository feedPostRepository;

    @InjectMocks private CommentService commentService;

    private User user;
    private FeedPost post;

    @BeforeEach
    void setUp() {
        user = TestDataFactory.player();
        post = TestDataFactory.feedPost(user);
    }

    @Test
    void createComment_shouldSaveAndReturnComment() {
        Comment saved = TestDataFactory.comment(post, user);
        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.save(any(Comment.class))).thenReturn(saved);

        CommentResponse result = commentService.createComment(1L, "Nice post!", user);

        assertThat(result.getContent()).isEqualTo("Test comment");
        assertThat(result.getAuthorName()).isEqualTo("John Doe");

        ArgumentCaptor<Comment> captor = ArgumentCaptor.forClass(Comment.class);
        verify(commentRepository).save(captor.capture());
        assertThat(captor.getValue().getContent()).isEqualTo("Nice post!");
        assertThat(captor.getValue().getPost()).isEqualTo(post);
    }

    @Test
    void createComment_shouldThrowWhenPostNotFound() {
        when(feedPostRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> commentService.createComment(999L, "comment", user))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getCommentsForPost_shouldReturnOrderedComments() {
        Comment comment = TestDataFactory.comment(post, user);
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(1L))
                .thenReturn(List.of(comment));

        List<CommentResponse> result = commentService.getCommentsForPost(1L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAuthorName()).isEqualTo("John Doe");
    }
}