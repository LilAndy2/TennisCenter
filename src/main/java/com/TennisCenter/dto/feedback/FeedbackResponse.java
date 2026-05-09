package com.TennisCenter.dto.feedback;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FeedbackResponse {
    private Long id;
    private String userName;
    private String category;
    private Integer rating;
    private boolean wouldRecommend;
    private String message;
    private LocalDateTime submittedAt;
}