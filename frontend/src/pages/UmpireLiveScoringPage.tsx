import { SportsScore } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
    LoadingWrapper,
} from "../components/common/PageLayout";
import type { ScheduledMatch } from "../types/schedule";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../styles/theme";

function UmpireLiveScoringPage() {
    const [matches, setMatches] = useState<ScheduledMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await axiosInstance.get<ScheduledMatch[]>("/umpire/my-matches");
                setMatches(res.data);
            } catch (error) {
                console.error("Failed to load umpire matches", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const upcoming = matches.filter((m) => m.status !== "COMPLETED");
    const completed = matches.filter((m) => m.status === "COMPLETED");

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>Live Scoring</PageTitle>
                        <PageSubtitle>Matches assigned to you as an umpire.</PageSubtitle>
                    </PageHeader>

                    {loading ? (
                        <LoadingWrapper><CircularProgress /></LoadingWrapper>
                    ) : matches.length === 0 ? (
                        <EmptyCard>
                            <SportsScore sx={{ fontSize: 48, color: colors.primary }} />
                            <EmptyTitle>No matches assigned</EmptyTitle>
                            <EmptyText>
                                You don't have any matches assigned yet. An admin will assign
                                you to matches when they're scheduled.
                            </EmptyText>
                        </EmptyCard>
                    ) : (
                        <SectionsWrapper>
                            {upcoming.length > 0 && (
                                <Section>
                                    <SectionTitle>Upcoming Matches</SectionTitle>
                                    <MatchGrid>
                                        {upcoming.map((match) => (
                                            <MatchCard
                                                key={match.matchId}
                                                match={match}
                                                onStartScoring={() =>
                                                    navigate(`/umpire/live-scoring/${match.matchId}`)
                                                }
                                            />
                                        ))}
                                    </MatchGrid>
                                </Section>
                            )}
                            {completed.length > 0 && (
                                <Section>
                                    <SectionTitle>Completed</SectionTitle>
                                    <MatchGrid>
                                        {completed.map((match) => (
                                            <MatchCard
                                                key={match.matchId}
                                                match={match}
                                            />
                                        ))}
                                    </MatchGrid>
                                </Section>
                            )}
                        </SectionsWrapper>
                    )}
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

// ─── Match Card ───

function MatchCard({
                       match,
                       onStartScoring,
                   }: {
    match: ScheduledMatch;
    onStartScoring?: () => void;
}) {
    const isCompleted = match.status === "COMPLETED";

    return (
        <CardWrapper $completed={isCompleted}>
            <CardHeader>
                <TournamentBadge>{match.tournamentName}</TournamentBadge>
                <StatusBadge $completed={isCompleted}>
                    {isCompleted ? "Completed" : "Scheduled"}
                </StatusBadge>
            </CardHeader>
            <PlayersRow>
                <PlayerName $won={match.winnerName === match.playerOneName}>
                    {match.playerOneName}
                </PlayerName>
                <VsText>vs</VsText>
                <PlayerName $won={match.winnerName === match.playerTwoName}>
                    {match.playerTwoName}
                </PlayerName>
            </PlayersRow>
            {match.sets && match.sets.length > 0 && (
                <ScoreRow>
                    {match.sets.map((s, i) => (
                        <ScoreChunk key={s.setNumber}>
                            {s.playerOneGames}-{s.playerTwoGames}
                            {i < match.sets!.length - 1 && <ScoreSep> / </ScoreSep>}
                        </ScoreChunk>
                    ))}
                </ScoreRow>
            )}
            <MetaRow>
                {match.scheduledTime && (
                    <MetaItem>
                        {new Date(match.scheduledTime).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </MetaItem>
                )}
                {match.locationName && <MetaItem>{match.locationName}</MetaItem>}
                {match.courtNumber != null && <MetaItem>Court {match.courtNumber}</MetaItem>}
            </MetaRow>
            {!isCompleted && onStartScoring && (
                <StartScoringButton onClick={onStartScoring}>
                    <SportsScore sx={{ fontSize: 16 }} />
                    Start Live Scoring
                </StartScoringButton>
            )}
        </CardWrapper>
    );
}

export default UmpireLiveScoringPage;

// ─── Styled Components ───

const PageWrapper = styled(BasePageWrapper)`
    max-width: 60rem;
`;

const SectionsWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl};
`;

const Section = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const SectionTitle = styled(Typography)`
    font-size: 1.1rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const MatchGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
    gap: ${spacing.md};
`;

const EmptyCard = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.md};
    padding: ${spacing.xl} ${spacing.lg};
    background: ${colors.surface};
    border-radius: ${radius.xl};
    border: 1px solid ${colors.borderGreen};
    box-shadow: ${shadow.sm};
    text-align: center;
`;

const EmptyTitle = styled(Typography)`
    font-size: ${fontSize.xl} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const EmptyText = styled(Typography)`
    font-size: ${fontSize.base} !important;
    color: ${colors.textSecondary};
    max-width: 28rem;
`;

const CardWrapper = styled(Box)<{ $completed: boolean }>`
    background: ${({ $completed }) => ($completed ? "#f0fdf4" : "white")};
    border: 1.5px solid ${({ $completed }) => ($completed ? "#a7f3d0" : "#e5e7eb")};
    border-radius: ${radius.lg};
    padding: ${spacing.md};
    box-shadow: ${shadow.sm};
    transition: all ${transition.fast};
`;

const CardHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.sm};
`;

const TournamentBadge = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.primary};
`;

const StatusBadge = styled(Typography)<{ $completed: boolean }>`
    font-size: 0.7rem !important;
    font-weight: 800 !important;
    padding: 0.2rem 0.5rem;
    border-radius: ${radius.pill};
    background: ${({ $completed }) => ($completed ? "#dcfce7" : "#eff6ff")};
    color: ${({ $completed }) => ($completed ? "#15803d" : "#1d4ed8")};
`;

const PlayersRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: ${spacing.xs};
`;

const PlayerName = styled(Typography)<{ $won: boolean }>`
    font-size: ${fontSize.sm} !important;
    font-weight: ${({ $won }) => ($won ? 800 : 500)} !important;
    color: ${({ $won }) => ($won ? "#111827" : "#475569")};
`;

const VsText = styled(Typography)`
    font-size: 0.75rem !important;
    color: #94a3b8;
    font-weight: 700 !important;
`;

const ScoreRow = styled(Box)`
    display: flex;
    gap: 0.3rem;
    margin-bottom: ${spacing.xs};
    padding: 0.3rem 0.5rem;
    border-radius: ${radius.sm};
    background: rgba(0, 0, 0, 0.03);
`;

const ScoreChunk = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 700 !important;
    color: #0f172a;
`;

const ScoreSep = styled.span`
    color: #94a3b8;
`;

const MetaRow = styled(Box)`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: ${spacing.sm};
`;

const MetaItem = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    font-weight: 500 !important;
`;

const StartScoringButton = styled.button`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    justify-content: center;
    padding: 0.6rem;
    border: 1.5px solid ${colors.primary};
    border-radius: ${radius.md};
    background: ${colors.primaryLighter};
    color: ${colors.primaryDark};
    font-size: ${fontSize.sm};
    font-weight: 700;
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: ${colors.primary};
        color: white;
    }

    &:active {
        transform: scale(0.98);
    }
`;