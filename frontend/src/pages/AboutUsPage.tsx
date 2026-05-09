import {
    CheckCircleOutline,
    EmojiEvents,
    Groups,
    Leaderboard,
    Send,
    SportsTennis,
} from "@mui/icons-material";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    NarrowPageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
} from "../components/common/PageLayout";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../styles/theme";

const CATEGORIES = [
    { value: "GENERAL", label: "General" },
    { value: "TOURNAMENTS", label: "Tournaments" },
    { value: "MATCHMAKING", label: "Matchmaking" },
    { value: "UI_UX", label: "Design & Usability" },
    { value: "BUG_REPORT", label: "Bug Report" },
    { value: "FEATURE_REQUEST", label: "Feature Request" },
];

const FEATURES = [
    {
        icon: <EmojiEvents sx={{ fontSize: 28, color: colors.primary }} />,
        title: "Tournaments",
        description:
            "Organize and participate in local tournaments with automatic bracket generation, group stages, and live scoring.",
    },
    {
        icon: <Leaderboard sx={{ fontSize: 28, color: colors.primary }} />,
        title: "Rankings & Stats",
        description:
            "Track your performance with dynamic rankings, match history, head-to-head records, and detailed player statistics.",
    },
    {
        icon: <Groups sx={{ fontSize: 28, color: colors.primary }} />,
        title: "Community",
        description:
            "Connect with fellow players through the activity feed, real-time chat, and player profiles.",
    },
    {
        icon: <SportsTennis sx={{ fontSize: 28, color: colors.primary }} />,
        title: "Match Scheduling",
        description:
            "Schedule matches across multiple locations and courts, with a dedicated calendar view for all upcoming games.",
    },
];

function AboutUsPage() {
    const [category, setCategory] = useState("");
    const [rating, setRating] = useState<number | null>(null);
    const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmitFeedback = async () => {
        setError("");

        if (!category) {
            setError("Please select a category.");
            return;
        }
        if (rating === null) {
            setError("Please select a rating.");
            return;
        }
        if (wouldRecommend === null) {
            setError("Please indicate if you would recommend us.");
            return;
        }
        if (!message.trim()) {
            setError("Please enter your feedback message.");
            return;
        }

        try {
            setSubmitting(true);
            await axiosInstance.post("/player/feedback", {
                category,
                rating,
                wouldRecommend,
                message: message.trim(),
            });
            setSubmitted(true);
        } catch {
            setError("Failed to submit feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReset = () => {
        setCategory("");
        setRating(null);
        setWouldRecommend(null);
        setMessage("");
        setSubmitted(false);
        setError("");
    };

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>About TennisLocal</PageTitle>
                        <PageSubtitle>
                            Your local tennis community platform — built for players, by players.
                        </PageSubtitle>
                    </PageHeader>

                    {/* ── Mission Section ── */}
                    <ContentCard>
                        <MissionText>
                            TennisLocal was created to bring local tennis communities closer together.
                            Whether you're a beginner stepping onto the court for the first time or an
                            experienced player chasing tournament titles, our platform helps you find
                            matches, track your progress, and connect with fellow tennis enthusiasts
                            in your area.
                        </MissionText>
                    </ContentCard>

                    {/* ── Features Grid ── */}
                    <FeaturesGrid>
                        {FEATURES.map((feature) => (
                            <FeatureCard key={feature.title}>
                                <FeatureIconWrapper>{feature.icon}</FeatureIconWrapper>
                                <FeatureTitle>{feature.title}</FeatureTitle>
                                <FeatureDescription>{feature.description}</FeatureDescription>
                            </FeatureCard>
                        ))}
                    </FeaturesGrid>

                    {/* ── Feedback Form ── */}
                    <FeedbackCard>
                        <FeedbackHeader>
                            <FeedbackTitle>Share Your Feedback</FeedbackTitle>
                            <FeedbackSubtitle>
                                Help us improve TennisLocal — we'd love to hear what you think.
                            </FeedbackSubtitle>
                        </FeedbackHeader>

                        {submitted ? (
                            <SuccessState>
                                <CheckCircleOutline
                                    sx={{ fontSize: 48, color: colors.primary }}
                                />
                                <SuccessTitle>Thank you for your feedback!</SuccessTitle>
                                <SuccessText>
                                    Your response has been recorded. We appreciate you taking the
                                    time to help us improve.
                                </SuccessText>
                                <ResetButton onClick={handleReset}>
                                    Submit another response
                                </ResetButton>
                            </SuccessState>
                        ) : (
                            <FeedbackForm>
                                {/* SELECT — Category */}
                                <FieldGroup>
                                    <FieldLabel>Feedback category</FieldLabel>
                                    <StyledSelect
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Select a category...
                                        </option>
                                        {CATEGORIES.map((cat) => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
                                    </StyledSelect>
                                </FieldGroup>

                                {/* RADIO — Rating */}
                                <FieldGroup>
                                    <FieldLabel>
                                        How would you rate your overall experience?
                                    </FieldLabel>
                                    <RadioGroup>
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <RadioOption
                                                key={value}
                                                $selected={rating === value}
                                                onClick={() => setRating(value)}
                                            >
                                                <RadioCircle $selected={rating === value}>
                                                    {rating === value && <RadioDot />}
                                                </RadioCircle>
                                                <RadioLabel>
                                                    {value} —{" "}
                                                    {value === 1
                                                        ? "Poor"
                                                        : value === 2
                                                            ? "Fair"
                                                            : value === 3
                                                                ? "Good"
                                                                : value === 4
                                                                    ? "Very Good"
                                                                    : "Excellent"}
                                                </RadioLabel>
                                            </RadioOption>
                                        ))}
                                    </RadioGroup>
                                </FieldGroup>

                                {/* CHECKBOX — Would recommend */}
                                <FieldGroup>
                                    <CheckboxRow
                                        onClick={() =>
                                            setWouldRecommend((prev) =>
                                                prev === null ? true : !prev
                                            )
                                        }
                                    >
                                        <CheckboxBox $checked={wouldRecommend === true}>
                                            {wouldRecommend === true && (
                                                <CheckCircleOutline
                                                    sx={{ fontSize: 16, color: "white" }}
                                                />
                                            )}
                                        </CheckboxBox>
                                        <CheckboxLabel>
                                            I would recommend TennisLocal to other players
                                        </CheckboxLabel>
                                    </CheckboxRow>
                                </FieldGroup>

                                {/* TEXTAREA — Message */}
                                <FieldGroup>
                                    <FieldLabel>Your feedback</FieldLabel>
                                    <StyledTextarea
                                        placeholder="Tell us what you like, what could be improved, or any ideas you have..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                    />
                                </FieldGroup>

                                {error && (
                                    <Alert severity="error" sx={{ borderRadius: "0.75rem" }}>
                                        {error}
                                    </Alert>
                                )}

                                <SubmitButton
                                    onClick={handleSubmitFeedback}
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <CircularProgress size={18} sx={{ color: "white" }} />
                                    ) : (
                                        <>
                                            <Send sx={{ fontSize: 18 }} />
                                            <span>Submit feedback</span>
                                        </>
                                    )}
                                </SubmitButton>
                            </FeedbackForm>
                        )}
                    </FeedbackCard>
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default AboutUsPage;

/* ─── Styled Components ─── */

const PageWrapper = styled(NarrowPageWrapper)`
    max-width: 56rem;
    display: flex;
    flex-direction: column;
    gap: ${spacing.lg};
`;

const ContentCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.xl};
    box-shadow: ${shadow.sm};
`;

const MissionText = styled(Typography)`
    font-size: ${fontSize.base} !important;
    color: ${colors.textSecondary};
    line-height: 1.75 !important;
`;

/* ── Features ── */

const FeaturesGrid = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.sm}) {
        grid-template-columns: 1fr;
    }
`;

const FeatureCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    box-shadow: ${shadow.sm};
    transition: all ${transition.normal};

    &:hover {
        border-color: ${colors.borderGreen};
        box-shadow: ${shadow.md};
    }
`;

const FeatureIconWrapper = styled(Box)`
    width: 3rem;
    height: 3rem;
    border-radius: ${radius.lg};
    background: ${colors.primaryLighter};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${spacing.sm};
`;

const FeatureTitle = styled(Typography)`
    font-size: ${fontSize.md} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    margin-bottom: 0.3rem !important;
`;

const FeatureDescription = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
    line-height: 1.6 !important;
`;

/* ── Feedback Form ── */

const FeedbackCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.borderGreen};
    border-radius: ${radius.xl};
    padding: ${spacing.xl};
    box-shadow: ${shadow.sm};
`;

const FeedbackHeader = styled(Box)`
    margin-bottom: ${spacing.lg};
`;

const FeedbackTitle = styled(Typography)`
    font-size: ${fontSize.xl} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    margin-bottom: 0.3rem !important;
`;

const FeedbackSubtitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
`;

const FeedbackForm = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.lg};
`;

const FieldGroup = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs};
`;

const FieldLabel = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const StyledSelect = styled.select`
    height: 2.75rem;
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    padding: 0 ${spacing.sm};
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    background: ${colors.surface};
    outline: none;
    cursor: pointer;
    transition: border-color ${transition.fast};

    &:focus {
        border-color: ${colors.primary};
    }
`;

/* ── Radio ── */

const RadioGroup = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xs};
`;

const RadioOption = styled(Box)<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.xs} ${spacing.sm};
    border-radius: ${radius.md};
    cursor: pointer;
    transition: background ${transition.fast};
    background: ${({ $selected }) =>
    $selected ? colors.primaryLighter : "transparent"};

    &:hover {
        background: ${({ $selected }) =>
    $selected ? colors.primaryLighter : colors.surfaceHover};
    }
`;

const RadioCircle = styled(Box)<{ $selected: boolean }>`
    width: 1.15rem;
    height: 1.15rem;
    border-radius: 50%;
    border: 2px solid
        ${({ $selected }) => ($selected ? colors.primary : colors.border)};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: border-color ${transition.fast};
`;

const RadioDot = styled(Box)`
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: ${colors.primary};
`;

const RadioLabel = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textPrimary};
`;

/* ── Checkbox ── */

const CheckboxRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    cursor: pointer;
    padding: ${spacing.xs} 0;
`;

const CheckboxBox = styled(Box)<{ $checked: boolean }>`
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 0.3rem;
    border: 2px solid
        ${({ $checked }) => ($checked ? colors.primary : colors.border)};
    background: ${({ $checked }) => ($checked ? colors.primary : "transparent")};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all ${transition.fast};
`;

const CheckboxLabel = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textPrimary};
`;

/* ── Textarea ── */

const StyledTextarea = styled.textarea`
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    padding: ${spacing.sm};
    font-size: ${fontSize.sm};
    font-family: inherit;
    color: ${colors.textPrimary};
    resize: vertical;
    min-height: 6rem;
    outline: none;
    transition: border-color ${transition.fast};
    line-height: 1.6;

    &::placeholder {
        color: ${colors.textHint};
    }

    &:focus {
        border-color: ${colors.primary};
    }
`;

/* ── Submit ── */

const SubmitButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.lg};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};
    align-self: flex-start;

    &:hover:not(:disabled) {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

/* ── Success State ── */

const SuccessState = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.sm};
    padding: ${spacing.xl} 0;
`;

const SuccessTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const SuccessText = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
    text-align: center;
    max-width: 24rem;
`;

const ResetButton = styled.button`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};
    margin-top: ${spacing.xs};

    &:hover {
        background: ${colors.surfaceAltHover};
    }
`;