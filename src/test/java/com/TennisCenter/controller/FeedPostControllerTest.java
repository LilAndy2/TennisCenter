package com.TennisCenter.controller;

import com.TennisCenter.dto.feed.FeedPostResponse;
import com.TennisCenter.exception.ResourceNotFoundException;
import com.TennisCenter.exception.UnauthorizedActionException;
import com.TennisCenter.service.FeedPostService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class FeedPostControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private FeedPostService feedPostService;

    @Test
    void getAllPosts_shouldReturn200() throws Exception {
        FeedPostResponse post = FeedPostResponse.builder()
                .id(1L)
                .authorName("Alice Smith")
                .content("Great match today!")
                .createdAt(LocalDateTime.now().toString())
                .likesCount(5)
                .build();
        when(feedPostService.getAllPosts(any())).thenReturn(List.of(post));

        mockMvc.perform(get("/api/player/feed/posts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].authorName").value("Alice Smith"))
                .andExpect(jsonPath("$[0].likesCount").value(5));
    }

    @Test
    void deletePost_shouldReturn200() throws Exception {
        doNothing().when(feedPostService).deletePost(eq(1L), any());

        mockMvc.perform(delete("/api/player/feed/posts/1"))
                .andExpect(status().isOk());

        verify(feedPostService).deletePost(eq(1L), any());
    }

    @Test
    void deletePost_shouldReturn404WhenNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Post not found"))
                .when(feedPostService).deletePost(eq(99L), any());

        mockMvc.perform(delete("/api/player/feed/posts/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletePost_shouldReturn403WhenNotAuthor() throws Exception {
        doThrow(new UnauthorizedActionException("You do not have permission"))
                .when(feedPostService).deletePost(eq(1L), any());

        mockMvc.perform(delete("/api/player/feed/posts/1"))
                .andExpect(status().isForbidden());
    }
}