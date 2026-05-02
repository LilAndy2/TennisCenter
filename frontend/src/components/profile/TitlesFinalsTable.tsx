import { EmojiEvents, MilitaryTech } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { TitleFinal } from "../../types/profile";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../../styles/theme";

type TitlesFinalsTableProps = {
    entries: TitleFinal[];
};

function TitlesFinalsTable({ entries }: TitlesFinalsTableProps) {
    const navigate = useNavigate();

    if (entries.length === 0) {
        return (
            <EmptyState>
                <EmptyText>No finals played yet.</EmptyText>
            </EmptyState>
        );
    }

    const titles = entries.filter((e) => e.won);
    const runnerUps = entries.filter((e) => !e.won);

    const getLevelColors = (level: string | null) => {
        if (!level) return { bg: "#f8fafc", border: "#e5e7eb", text: "#334155" };
        return colors.levels[level] ?? { bg: "#f8fafc", border: "#e5e7eb", text: "#334155" };
    };

    return (
        <Wrapper>
            {titles.length > 0 && (
                <GroupSection>
                    <GroupHeader>
                        <EmojiEvents sx={{ fontSize: 20, color: "#f59e0b" }} />
                        <GroupLabel>
                            Titles ({titles.length})
                        </GroupLabel>
                    </GroupHeader>
                    <CardsList>
                        {titles.map((entry) => {
                            const lc = getLevelColors(entry.tournamentLevel);
                            return (
                                <FinalCard key={entry.tournamentId} $bg={lc.bg} $border={lc.border}>
                                    <CardLeft>
                                        <TrophyIcon $bg={lc.bg}>
                                            <EmojiEvents sx={{ fontSize: 22, color: "#f59e0b" }} />
                                        </TrophyIcon>
                                        <CardInfo>
                                            <TournamentNameLink
                                                onClick={() => navigate(`/tournaments/${entry.tournamentId}`)}
                                            >
                                                {entry.tournamentName}
                                            </TournamentNameLink>
                                            <MetaRow>
                                                <MetaText>{formatDate(entry.date)}</MetaText>
                                                {entry.surface && (
                                                    <>
                                                        <MetaDot />
                                                        <MetaText>{entry.surface}</MetaText>
                                                    </>
                                                )}
                                                {entry.tournamentLevel && (
                                                    <>
                                                        <MetaDot />
                                                        <MetaText>{entry.tournamentLevel}</MetaText>
                                                    </>
                                                )}
                                            </MetaRow>
                                        </CardInfo>
                                    </CardLeft>
                                    <CardRight>
                                        <VsLabel>def.</VsLabel>
                                        <OpponentLink
                                            onClick={() => navigate(`/profile/${entry.opponentId}`)}
                                        >
                                            {entry.opponentName}
                                        </OpponentLink>
                                        <ScoreText>{entry.result}</ScoreText>
                                    </CardRight>
                                </FinalCard>
                            );
                        })}
                    </CardsList>
                </GroupSection>
            )}

            {runnerUps.length > 0 && (
                <GroupSection>
                    <GroupHeader>
                        <MilitaryTech sx={{ fontSize: 20, color: "#94a3b8" }} />
                        <GroupLabel>
                            Runner-up ({runnerUps.length})
                        </GroupLabel>
                    </GroupHeader>
                    <CardsList>
                        {runnerUps.map((entry) => {
                            const lc = getLevelColors(entry.tournamentLevel);
                            return (
                                <FinalCard key={entry.tournamentId} $bg={lc.bg} $border={lc.border}>
                                    <CardLeft>
                                        <TrophyIcon $bg={lc.bg}>
                                            <MilitaryTech sx={{ fontSize: 22, color: "#94a3b8" }} />
                                        </TrophyIcon>
                                        <CardInfo>
                                            <TournamentNameLink
                                                onClick={() => navigate(`/tournaments/${entry.tournamentId}`)}
                                            >
                                                {entry.tournamentName}
                                            </TournamentNameLink>
                                            <MetaRow>
                                                <MetaText>{formatDate(entry.date)}</MetaText>
                                                {entry.surface && (
                                                    <>
                                                        <MetaDot />
                                                        <MetaText>{entry.surface}</MetaText>
                                                    </>
                                                )}
                                                {entry.tournamentLevel && (
                                                    <>
                                                        <MetaDot />
                                                        <MetaText>{entry.tournamentLevel}</MetaText>
                                                    </>
                                                )}
                                            </MetaRow>
                                        </CardInfo>
                                    </CardLeft>
                                    <CardRight>
                                        <VsLabel>lost to</VsLabel>
                                        <OpponentLink
                                            onClick={() => navigate(`/profile/${entry.opponentId}`)}
                                        >
                                            {entry.opponentName}
                                        </OpponentLink>
                                        <ScoreText>{entry.result}</ScoreText>
                                    </CardRight>
                                </FinalCard>
                            );
                        })}
                    </CardsList>
                </GroupSection>
            )}
        </Wrapper>
    );
}

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default TitlesFinalsTable;

/* ─── Styled Components ─── */

const Wrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.lg};
`;

const GroupSection = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const GroupHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-bottom: 0.25rem;
`;

const GroupLabel = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const CardsList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const FinalCard = styled(Box)<{ $bg: string; $border: string }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.md};
    padding: 0.85rem 1rem;
    border-radius: ${radius.lg};
    border: 1px solid ${({ $border }) => $border};
    background: ${({ $bg }) => $bg};
    transition: box-shadow ${transition.fast};

    &:hover {
        box-shadow: ${shadow.sm};
    }
`;

const CardLeft = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
`;

const TrophyIcon = styled(Box)<{ $bg: string }>`
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${({ $bg }) => $bg};
    filter: brightness(0.95);
`;

const CardInfo = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 0;
`;

const TournamentNameLink = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.primaryDark};
    cursor: pointer;
    transition: color ${transition.fast};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
        color: ${colors.primary};
        text-decoration: underline;
    }
`;

const MetaRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.3rem;
`;

const MetaText = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
`;

const MetaDot = styled(Box)`
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: ${colors.textHint};
`;

const CardRight = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
`;

const VsLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textHint};
    font-style: italic;
`;

const OpponentLink = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.semibold} !important;
    color: ${colors.primaryDark};
    cursor: pointer;
    transition: color ${transition.fast};

    &:hover {
        color: ${colors.primary};
        text-decoration: underline;
    }
`;

const ScoreText = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    font-variant-numeric: tabular-nums;
`;

const EmptyState = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${spacing.xxl};
`;

const EmptyText = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.base} !important;
`;