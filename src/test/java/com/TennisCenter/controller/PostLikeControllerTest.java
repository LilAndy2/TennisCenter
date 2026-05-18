package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.service.PostLikeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class PostLikeControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private PostLikeService postLikeService;

    @Test
    void toggleLike_shouldReturn200() throws Exception {
        FeedPostResponse resp = FeedPostResponse.builder()
                .id(1L).likesCount(6).likedByCurrentUser(true).build();
        when(postLikeService.toggleLike(eq(1L), any())).thenReturn(resp);

        mockMvc.perform(post("/api/player/feed/posts/1/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likesCount").value(6))
                .andExpect(jsonPath("$.likedByCurrentUser").value(true));
    }

    @Test
    void toggleLike_shouldReturn404WhenPostNotFound() throws Exception {
        when(postLikeService.toggleLike(eq(99L), any()))
                .thenThrow(new ResourceNotFoundException("Post not found"));

        mockMvc.perform(post("/api/player/feed/posts/99/like"))
                .andExpect(status().isNotFound());
    }
}