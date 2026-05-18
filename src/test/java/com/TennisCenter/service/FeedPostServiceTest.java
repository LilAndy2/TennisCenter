package com.TennisCenter.service;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.CommentRepository;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.repository.PlayerProfileRepository;
import com.TennisCenter.repository.PostLikeRepository;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedPostServiceTest {

    @Mock private FeedPostRepository feedPostRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private PostLikeRepository postLikeRepository;
    @Mock private PlayerProfileRepository playerProfileRepository;

    @InjectMocks private FeedPostService feedPostService;

    private User author;

    @BeforeEach
    void setUp() {
        author = TestDataFactory.player();
        ReflectionTestUtils.setField(feedPostService, "uploadDir", "/tmp/test-uploads");
    }

    @Test
    void getAllPosts_shouldReturnPostsInDescOrder() {
        FeedPost post = TestDataFactory.feedPost(author);
        when(feedPostRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(post));
        when(commentRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);
        when(playerProfileRepository.findByUserId(any())).thenReturn(Optional.empty());

        List<FeedPostResponse> result = feedPostService.getAllPosts(author);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("Test post content");
    }

    @Test
    void createPost_shouldSavePostWithTextOnly() {
        FeedPost savedPost = TestDataFactory.feedPost(author);
        when(feedPostRepository.save(any(FeedPost.class))).thenReturn(savedPost);
        when(commentRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);
        when(playerProfileRepository.findByUserId(any())).thenReturn(Optional.empty());

        FeedPostResponse result = feedPostService.createPost("Hello world", null, author);

        assertThat(result).isNotNull();

        ArgumentCaptor<FeedPost> captor = ArgumentCaptor.forClass(FeedPost.class);
        verify(feedPostRepository).save(captor.capture());
        assertThat(captor.getValue().getContent()).isEqualTo("Hello world");
        assertThat(captor.getValue().getImageUrl()).isNull();
    }

    @Test
    void deletePost_shouldThrowWhenPostNotFound() {
        when(feedPostRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> feedPostService.deletePost(999L, author))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deletePost_shouldThrowWhenNotAuthor() {
        FeedPost post = TestDataFactory.feedPost(author);
        User otherUser = TestDataFactory.player(2L, "other", "other@test.com");

        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> feedPostService.deletePost(1L, otherUser))
                .isInstanceOf(UnauthorizedActionException.class);
    }

    @Test
    void updatePost_shouldUpdateContentAndTimestamp() {
        FeedPost post = TestDataFactory.feedPost(author);
        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(feedPostRepository.save(any())).thenReturn(post);
        when(commentRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.existsByPostIdAndUserId(any(), any())).thenReturn(false);
        when(playerProfileRepository.findByUserId(any())).thenReturn(Optional.empty());

        feedPostService.updatePost(1L, "Updated content", author);

        assertThat(post.getContent()).isEqualTo("Updated content");
        assertThat(post.getUpdatedAt()).isNotNull();
    }

    @Test
    void updatePost_shouldThrowWhenNotAuthor() {
        FeedPost post = TestDataFactory.feedPost(author);
        User otherUser = TestDataFactory.player(2L, "other", "other@test.com");

        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThatThrownBy(() -> feedPostService.updatePost(1L, "new", otherUser))
                .isInstanceOf(UnauthorizedActionException.class);
    }
}