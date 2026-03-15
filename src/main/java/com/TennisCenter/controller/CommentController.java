package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.CommentResponse;
import com.TennisCenter.dto.feed.CreateCommentRequest;
import com.TennisCenter.model.User;
import com.TennisCenter.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/feed/posts")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @PostMapping("/{postId}/comments")
    public CommentResponse createComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return commentService.createComment(postId, request.getContent(), user);
    }

    @GetMapping("/{postId}/comments")
    public List<CommentResponse> getComments(
            @PathVariable Long postId
    ) {
        return commentService.getCommentsForPost(postId);
    }
}
