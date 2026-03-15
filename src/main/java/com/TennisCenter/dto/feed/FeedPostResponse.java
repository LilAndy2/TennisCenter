package com.TennisCenter.dto.feed;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeedPostResponse {
    private Long id;
    private String authorName;
    private String authorRole;
    private String content;
    private String imageUrl;
    private String createdAt;
    private boolean owner;
    private int commentsCount;
    private int likesCount;
    private boolean likedByCurrentUser;
}
