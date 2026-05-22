package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.CommentResponse;
import com.TennisCenter.dto.feed.CreateCommentRequest;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.service.social.CommentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class CommentControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private CommentService commentService;

    @Test
    void createComment_shouldReturn200() throws Exception {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Nice match!");

        CommentResponse resp = CommentResponse.builder()
                .id(1L)
                .content("Nice match!")
                .authorName("Alice Smith")
                .createdAt(LocalDateTime.now().toString())
                .build();
        when(commentService.createComment(eq(1L), eq("Nice match!"), any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/player/feed/posts/1/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Nice match!\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Nice match!"));
    }

    @Test
    void getComments_shouldReturn200() throws Exception {
        CommentResponse resp = CommentResponse.builder()
                .id(1L)
                .content("Great play!")
                .authorName("Bob Jones")
                .build();
        when(commentService.getCommentsForPost(1L)).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/player/feed/posts/1/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Great play!"));
    }

    @Test
    void createComment_shouldReturn404WhenPostNotFound() throws Exception {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Test");

        when(commentService.createComment(eq(99L), any(), any()))
                .thenThrow(new ResourceNotFoundException("Post not found"));

        mockMvc.perform(post("/api/player/feed/posts/99/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Test\"}"))
                .andExpect(status().isNotFound());
    }
}