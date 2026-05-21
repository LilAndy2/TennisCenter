import { SportsScore } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
    LoadingWrapper,
} from "../components/common/PageLayout";
import UpdateMatchScoreDialog from "../components/admin/tournament-details/UpdateMatchScoreDialog";
import useMyMatches from "../hooks/useMyMatches";
import type { TournamentMatch } from "../types/match";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../styles/theme";

function MyMatchesPage() {
    const {
        scheduled,
        completedToday,
        loading,
        isScoreDialogOpen,
        selectedMatch,
        handleOpenScoreDialog,
        handleCloseScoreDialog,
        handleSubmitScore,
    } = useMyMatches();

    const hasMatches = scheduled.length > 0 || completedToday.length > 0;

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>My Matches</PageTitle>
                        <PageSubtitle>
                            Your upcoming and recently completed tournament matches.
                        </PageSubtitle>
                    </PageHeader>

                    {loading ? (
                        <LoadingWrapper><CircularProgress /></LoadingWrapper>
                    ) : !hasMatches ? (
                        <EmptyCard>
                            <SportsScore sx={{ fontSize: 48, color: colors.primary }} />
                            <EmptyTitle>No active matches</EmptyTitle>
                            <EmptyText>
                                You don't have any upcoming matches right now.
                                Once you're registered in a tournament and the bracket is generated,
                                your matches will appear here.
                            </EmptyText>
                        </EmptyCard>
                    ) : (
                        <SectionsWrapper>
                            {scheduled.length > 0 && (
                                <Section>
                                    <SectionTitle>Upcoming</SectionTitle>
                                    <MatchGrid>
                                        {scheduled.map((match) => (
                                            <MyMatchCard
                                                key={match.id}
                                                match={match}
                                                onEnterScore={handleOpenScoreDialog}
                                            />
                                        ))}
                                    </MatchGrid>
                                </Section>
                            )}

                            {completedToday.length > 0 && (
                                <Section>
                                    <SectionTitle>Completed today</SectionTitle>
                                    <MatchGrid>
                                        {completedToday.map((match) => (
                                            <MyMatchCard
                                                key={match.id}
                                                match={match}
                                            />
                                        ))}
                                    </MatchGrid>
                                </Section>
                            )}
                        </SectionsWrapper>
                    )}
                </PageWrapper>

                <UpdateMatchScoreDialog
                    open={isScoreDialogOpen}
                    match={selectedMatch}
                    onClose={handleCloseScoreDialog}
                    onSubmit={handleSubmitScore}
                />
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

function MyMatchCard({
                         match,
                         onEnterScore,
                     }: {
    match: TournamentMatch;
    onEnterScore?: (match: TournamentMatch) => void;
}) {
    const isCompleted = match.status === "COMPLETED";
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).id : null;
    const isWinner = match.winnerId === currentUserId;

    return (
        <CardWrapper $completed={isCompleted}>
            <CardTopRow>
                <TournamentBadge>Tournament #{match.tournamentId}</TournamentBadge>
                {isCompleted ? (
                    <ResultBadge $won={isWinner}>
                        {isWinner ? "Won" : "Lost"}
                    </ResultBadge>
                ) : (
                    <StatusBadge>Scheduled</StatusBadge>
                )}
            </CardTopRow>

            <PhaseBadge>
                {match.phase === "GROUP_STAGE"
                    ? `${match.groupName ?? "Group"} · Match ${match.matchOrder ?? ""}`
                    : `Round ${match.roundNumber ?? ""}`}
            </PhaseBadge>

            {isCompleted && match.sets.length > 0 ? (
                <Scoreboard>
                    <ScoreboardRow $bold={match.winnerId === match.playerOneId}>
                        <ScoreboardName>{match.playerOneName ?? "TBD"}</ScoreboardName>
                        {match.sets.map((set) => {
                            const tb =
                                set.playerOneTiebreakPoints != null &&
                                set.playerTwoTiebreakPoints != null &&
                                set.playerOneGames !== set.playerTwoGames
                                    ? (set.playerOneGames > set.playerTwoGames
                                        ? set.playerTwoTiebreakPoints
                                        : set.playerOneTiebreakPoints)
                                    : null;
                            return (
                                <ScoreboardCell key={set.setNumber}>
                                    {set.playerOneGames}
                                    {tb != null && <TiebreakSup>{tb}</TiebreakSup>}
                                </ScoreboardCell>
                            );
                        })}
                    </ScoreboardRow>
                    <ScoreboardRow $bold={match.winnerId === match.playerTwoId}>
                        <ScoreboardName>{match.playerTwoName ?? "TBD"}</ScoreboardName>
                        {match.sets.map((set) => {
                            const tb =
                                set.playerOneTiebreakPoints != null &&
                                set.playerTwoTiebreakPoints != null &&
                                set.playerOneGames !== set.playerTwoGames
                                    ? (set.playerTwoGames > set.playerOneGames
                                        ? set.playerOneTiebreakPoints
                                        : set.playerTwoTiebreakPoints)
                                    : null;
                            return (
                                <ScoreboardCell key={set.setNumber}>
                                    {set.playerTwoGames}
                                    {tb != null && <TiebreakSup>{tb}</TiebreakSup>}
                                </ScoreboardCell>
                            );
                        })}
                    </ScoreboardRow>
                </Scoreboard>
            ) : (
                <PlayersRow>
                    <PlayerName $highlight={false}>
                        {match.playerOneName ?? "TBD"}
                    </PlayerName>
                    <VsText>vs</VsText>
                    <PlayerName $highlight={false}>
                        {match.playerTwoName ?? "TBD"}
                    </PlayerName>
                </PlayersRow>
            )}

            {match.umpireName && (
                <MetaLine>Umpire: {match.umpireName}</MetaLine>
            )}

            {match.scheduledTime && (
                <MetaLine>
                    {new Date(match.scheduledTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {match.locationName ? ` · ${match.locationName}` : ""}
                    {match.courtNumber != null ? ` · Court ${match.courtNumber}` : ""}
                </MetaLine>
            )}

            {!isCompleted && onEnterScore && match.playerOneId != null && match.playerTwoId != null && (
                <EnterScoreButton onClick={() => onEnterScore(match)}>
                    Enter score
                </EnterScoreButton>
            )}
        </CardWrapper>
    );
}

export default MyMatchesPage;

/* ─── Styled Components ─── */

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
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
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
    line-height: 1.6 !important;
`;

const CardWrapper = styled(Box)<{ $completed: boolean }>`
    background: ${({ $completed }) => ($completed ? "#f0fdf4" : "white")};
    border: 1.5px solid ${({ $completed }) => ($completed ? "#a7f3d0" : "#e5e7eb")};
    border-radius: ${radius.lg};
    padding: ${spacing.md};
    box-shadow: ${shadow.sm};
    transition: border-color ${transition.fast};

    &:hover {
        border-color: ${({ $completed }) => ($completed ? "#6ee7b7" : "#d1d5db")};
    }
`;

const CardTopRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.25rem;
`;

const TournamentBadge = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.primary};
`;

const StatusBadge = styled(Typography)`
    font-size: 0.7rem !important;
    font-weight: 800 !important;
    padding: 0.2rem 0.5rem;
    border-radius: ${radius.pill};
    background: #eff6ff;
    color: #1d4ed8;
`;

const ResultBadge = styled(Typography)<{ $won: boolean }>`
    font-size: 0.7rem !important;
    font-weight: 800 !important;
    padding: 0.2rem 0.5rem;
    border-radius: ${radius.pill};
    background: ${({ $won }) => ($won ? "#dcfce7" : "#fef2f2")};
    color: ${({ $won }) => ($won ? "#15803d" : "#b91c1c")};
`;

const PhaseBadge = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 600 !important;
    color: ${colors.textMuted};
    margin-bottom: ${spacing.sm} !important;
`;

const PlayersRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
    margin-bottom: ${spacing.xs};
`;

const PlayerName = styled(Typography)<{ $highlight: boolean }>`
    font-size: ${fontSize.sm} !important;
    font-weight: ${({ $highlight }) => ($highlight ? 800 : 500)} !important;
    color: ${({ $highlight }) => ($highlight ? "#111827" : "#475569")};
`;

const VsText = styled(Typography)`
    font-size: 0.75rem !important;
    color: #94a3b8;
    font-weight: 700 !important;
`;

const Scoreboard = styled(Box)`
    display: flex;
    flex-direction: column;
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    overflow: hidden;
    margin-bottom: ${spacing.xs};
`;

const ScoreboardRow = styled(Box)<{ $bold: boolean }>`
    display: flex;
    align-items: center;
    padding: 0.45rem 0.65rem;
    background: ${({ $bold }) => ($bold ? "#f0fdf4" : "white")};

    &:first-child {
        border-bottom: 1px solid ${colors.border};
    }
`;

const ScoreboardName = styled(Typography)`
    flex: 1;
    font-size: ${fontSize.sm} !important;
    font-weight: inherit !important;
    color: inherit;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const ScoreboardCell = styled(Typography)`
    width: 2rem;
    text-align: center;
    font-size: ${fontSize.sm} !important;
    font-weight: inherit !important;
    color: inherit;
    flex-shrink: 0;
`;

const TiebreakSup = styled.sup`
    font-size: 0.55rem;
    font-weight: 700;
    vertical-align: super;
`;

const MetaLine = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    font-weight: 500 !important;
    margin-bottom: 0.15rem !important;
`;

const EnterScoreButton = styled.button`
    height: 2.35rem;
    width: 100%;
    margin-top: ${spacing.sm};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.98);
    }
`;