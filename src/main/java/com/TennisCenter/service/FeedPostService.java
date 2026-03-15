package com.TennisCenter.service;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.User;
import com.TennisCenter.repository.CommentRepository;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.repository.PostLikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedPostService {

    private final FeedPostRepository feedPostRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public List<FeedPostResponse> getAllPosts(User currentUser) {
        return feedPostRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(post -> mapToResponse(post, currentUser))
                .toList();
    }

    public FeedPostResponse createPost(String content, MultipartFile image, User currentUser) {
        String imageUrl = null;

        if (image != null && !image.isEmpty()) {
            imageUrl = saveImage(image);
        }

        FeedPost post = FeedPost.builder()
                .content(content)
                .imageUrl(imageUrl)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .author(currentUser)
                .build();

        FeedPost savedPost = feedPostRepository.save(post);
        return mapToResponse(savedPost, currentUser);
    }

    public void deletePost(Long postId, User currentUser) {
        FeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("You do not have permission to delete this post");
        }

        if (post.getImageUrl() != null && !post.getImageUrl().isBlank()) {
            deleteImageIfExists(post.getImageUrl());
        }

        feedPostRepository.delete(post);
    }

    public FeedPostResponse updatePost(Long postId, String content, User currentUser) {
        FeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new UnauthorizedActionException("You cannot edit this post");
        }

        post.setContent(content);
        post.setUpdatedAt(LocalDateTime.now());

        FeedPost updatedPost = feedPostRepository.save(post);

        return mapToResponse(updatedPost, currentUser);
    }

    public FeedPostResponse getPostResponse(FeedPost post, User currentUser) {
        return mapToResponse(post, currentUser);
    }

    private FeedPostResponse mapToResponse(FeedPost post, User currentUser) {
        return FeedPostResponse.builder()
                .id(post.getId())
                .authorName(post.getAuthor().getFirstName() + " " + post.getAuthor().getLastName())
                .authorRole(post.getAuthor().getRole().getDisplayName())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .createdAt(post.getCreatedAt().toString())
                .owner(post.getAuthor().getId().equals(currentUser.getId()))
                .commentsCount((int) commentRepository.countByPostId(post.getId()))
                .likesCount((int) postLikeRepository.countByPostId(post.getId()))
                .likedByCurrentUser(postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUser.getId()))
                .build();
    }

    private String saveImage(MultipartFile image) {
        try {
            Path uploadPath = Paths.get(uploadDir);

            if(!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save image");
        }
    }

    private void deleteImageIfExists(String imageUrl) {
        try {
            String fileName = imageUrl.replace("/uploads/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete image");
        }
    }
}
