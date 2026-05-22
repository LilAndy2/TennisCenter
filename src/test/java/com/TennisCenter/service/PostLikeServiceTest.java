package com.TennisCenter.service;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.PostLike;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.repository.PostLikeRepository;
import com.TennisCenter.service.social.FeedPostService;
import com.TennisCenter.service.social.PostLikeService;
import com.TennisCenter.util.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostLikeServiceTest {

    @Mock private PostLikeRepository postLikeRepository;
    @Mock private FeedPostRepository feedPostRepository;
    @Mock private FeedPostService feedPostService;

    @InjectMocks private PostLikeService postLikeService;

    private User user;
    private FeedPost post;

    @BeforeEach
    void setUp() {
        user = TestDataFactory.player();
        post = TestDataFactory.feedPost(user);
    }

    @Test
    void toggleLike_shouldAddLikeWhenNotExists() {
        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndUserId(1L, 1L)).thenReturn(Optional.empty());
        when(feedPostService.getPostResponse(any(), any()))
                .thenReturn(FeedPostResponse.builder().id(1L).build());

        postLikeService.toggleLike(1L, user);

        verify(postLikeRepository).save(any(PostLike.class));
        verify(postLikeRepository, never()).delete(any(PostLike.class));
    }

    @Test
    void toggleLike_shouldRemoveLikeWhenExists() {
        PostLike existingLike = TestDataFactory.postLike(post, user);
        when(feedPostRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postLikeRepository.findByPostIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(existingLike));
        when(feedPostService.getPostResponse(any(), any()))
                .thenReturn(FeedPostResponse.builder().id(1L).build());

        postLikeService.toggleLike(1L, user);

        verify(postLikeRepository).delete(existingLike);
        verify(postLikeRepository, never()).save(any(PostLike.class));
    }

    @Test
    void toggleLike_shouldThrowWhenPostNotFound() {
        when(feedPostRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postLikeService.toggleLike(999L, user))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}