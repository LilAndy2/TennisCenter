package com.TennisCenter.dto.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeedbackRequest {

    @NotNull
    private String category;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    @NotNull
    private Boolean wouldRecommend;

    @NotBlank
    private String message;
}