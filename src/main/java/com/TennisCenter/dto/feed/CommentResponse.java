package com.TennisCenter.dto.feed;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String authorName;
    private String content;
    private String createdAt;
}
