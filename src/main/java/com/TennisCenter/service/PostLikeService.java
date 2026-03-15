package com.TennisCenter.service;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.PostLike;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PostLikeService {

    private final PostLikeRepository postLikeRepository;
    private final FeedPostRepository feedPostRepository;
    private final FeedPostService feedPostService;

    public FeedPostResponse toggleLike(Long postId, User currentUser) {
        FeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        postLikeRepository.findByPostIdAndUserId(postId, currentUser.getId())
                .ifPresentOrElse(
                        postLikeRepository::delete,
                        () -> {
                            PostLike postLike = PostLike.builder()
                                    .post(post)
                                    .user(currentUser)
                                    .createdAt(LocalDateTime.now())
                                    .build();

                            postLikeRepository.save(postLike);
                        }
                );

        return feedPostService.getPostResponse(post, currentUser);
    }
}
