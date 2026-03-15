package com.TennisCenter.service;

import com.TennisCenter.dto.feed.CommentResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.repository.CommentRepository;
import com.TennisCenter.repository.FeedPostRepository;
import com.TennisCenter.model.Comment;
import com.TennisCenter.model.FeedPost;
import com.TennisCenter.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final FeedPostRepository feedPostRepository;

    public CommentResponse createComment(Long postId, String content, User user) {
        FeedPost post = feedPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post Not Found"));

        Comment comment = Comment.builder()
                .content(content)
                .createdAt(LocalDateTime.now())
                .author(user)
                .post(post)
                .build();

        Comment savedComment = commentRepository.save(comment);

        return mapToResponse(savedComment);
    }

    public List<CommentResponse> getCommentsForPost(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private CommentResponse mapToResponse(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .authorName(comment.getAuthor().getUsername())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt().toString())
                .build();
    }
}
