package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.FeedPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/player/feed/posts")
@RequiredArgsConstructor
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class FeedPostController {

    private final FeedPostService feedPostService;

    @GetMapping
    public List<FeedPostResponse> getAllPosts(@AuthenticationPrincipal User currentUser) {
        return feedPostService.getAllPosts(currentUser);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public FeedPostResponse createPost(
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal User currentUser
    ) {
        return feedPostService.createPost(content, image, currentUser);
    }

    @DeleteMapping("/{postId}")
    public void deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser
    ) {
        feedPostService.deletePost(postId, currentUser);
    }
}
