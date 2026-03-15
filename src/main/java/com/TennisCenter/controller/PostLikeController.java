package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.PostLikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/player/feed/posts")
@RequiredArgsConstructor
public class PostLikeController {

    private final PostLikeService postLikeService;

    @PostMapping("/{postId}/like")
    public FeedPostResponse toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser
    ) {
        return postLikeService.toggleLike(postId, currentUser);
    }
}
