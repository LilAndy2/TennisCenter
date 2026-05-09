package com.TennisCenter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Async
    public void sendFeedbackConfirmation(String toEmail, String userName, String category, int rating) {
        String subject = "Thanks for your feedback, " + userName + "!";

        String ratingStars = "★".repeat(rating) + "☆".repeat(5 - rating);

        String body = """
                <html>
                <body style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 2rem;">
                    <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 1rem; padding: 2rem; border: 1px solid #e5e7eb;">
                        <div style="text-align: center; margin-bottom: 1.5rem;">
                            <span style="font-size: 2rem;">🎾</span>
                            <h2 style="color: #111827; margin: 0.5rem 0 0.25rem;">Thank you for your feedback!</h2>
                            <p style="color: #64748b; font-size: 0.9rem; margin: 0;">We appreciate you taking the time to share your thoughts.</p>
                        </div>
                        
                        <div style="background: #f0fdf4; border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
                            <p style="margin: 0.25rem 0; color: #334155; font-size: 0.9rem;">
                                <strong>Category:</strong> %s
                            </p>
                            <p style="margin: 0.25rem 0; color: #334155; font-size: 0.9rem;">
                                <strong>Your rating:</strong> <span style="color: #f59e0b;">%s</span>
                            </p>
                        </div>
                        
                        <p style="color: #475569; font-size: 0.9rem; line-height: 1.6;">
                            Hi %s, your feedback about <strong>%s</strong> has been received.
                            Our team reviews every submission to improve TennisLocal for the community.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1.5rem 0;" />
                        
                        <p style="color: #94a3b8; font-size: 0.75rem; text-align: center; margin: 0;">
                            TennisLocal — Your local tennis community platform
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(formatCategory(category), ratingStars, userName, formatCategory(category));

        sendHtmlEmail(toEmail, subject, body);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("noreply@tennislocal.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (MessagingException e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String formatCategory(String category) {
        return switch (category) {
            case "GENERAL" -> "General";
            case "TOURNAMENTS" -> "Tournaments";
            case "MATCHMAKING" -> "Matchmaking";
            case "UI_UX" -> "Design & Usability";
            case "BUG_REPORT" -> "Bug Report";
            case "FEATURE_REQUEST" -> "Feature Request";
            default -> category;
        };
    }
}