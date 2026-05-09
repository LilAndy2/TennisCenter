package com.TennisCenter.service;

import com.TennisCenter.dto.feedback.FeedbackRequest;
import com.TennisCenter.dto.feedback.FeedbackResponse;
import com.TennisCenter.model.Feedback;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.FeedbackCategory;
import com.TennisCenter.repository.FeedbackRepository;
import com.TennisCenter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackResponse submitFeedback(Long userId, FeedbackRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback feedback = Feedback.builder()
                .user(user)
                .category(FeedbackCategory.valueOf(request.getCategory()))
                .rating(request.getRating())
                .wouldRecommend(request.getWouldRecommend())
                .message(request.getMessage())
                .submittedAt(LocalDateTime.now())
                .build();

        feedbackRepository.save(feedback);

        return toResponse(feedback);
    }

    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAllByOrderBySubmittedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .userName(feedback.getUser().getFirstName() + " " + feedback.getUser().getLastName())
                .category(feedback.getCategory().name())
                .rating(feedback.getRating())
                .wouldRecommend(feedback.isWouldRecommend())
                .message(feedback.getMessage())
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }
}