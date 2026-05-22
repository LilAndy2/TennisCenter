package com.TennisCenter.service.social;

import com.TennisCenter.dto.feedback.FeedbackRequest;
import com.TennisCenter.dto.feedback.FeedbackResponse;
import com.TennisCenter.model.Feedback;
import com.TennisCenter.model.User;
import com.TennisCenter.model.enums.FeedbackCategory;
import com.TennisCenter.repository.FeedbackRepository;
import com.TennisCenter.repository.UserRepository;
import com.TennisCenter.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

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

        // Send confirmation email via MailTrap
        emailService.sendFeedbackConfirmation(
                user.getEmail(),
                user.getFullName(),
                request.getCategory(),
                request.getRating()
        );

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
                .userName(feedback.getUser().getFullName())
                .category(feedback.getCategory().name())
                .rating(feedback.getRating())
                .wouldRecommend(feedback.isWouldRecommend())
                .message(feedback.getMessage())
                .submittedAt(feedback.getSubmittedAt())
                .build();
    }
}