package com.TennisCenter.controller;

import com.TennisCenter.dto.feedback.FeedbackRequest;
import com.TennisCenter.dto.feedback.FeedbackResponse;
import com.TennisCenter.model.User;
import com.TennisCenter.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/player/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public FeedbackResponse submitFeedback(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal User user
    ) {
        return feedbackService.submitFeedback(user.getId(), request);
    }

    @GetMapping
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackService.getAllFeedback();
    }
}