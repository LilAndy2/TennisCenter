import { CheckCircle, Cancel } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { MatchHistoryEntry } from "../../types/profile";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../../styles/theme";

type MatchHistoryTableProps = {
    matches: MatchHistoryEntry[];
    profileUserId: number;
};

type TournamentGroup = {
    tournamentId: number;
    tournamentName: string;
    surface: string | null;
    matches: MatchHistoryEntry[];
};

function MatchHistoryTable({ matches, profileUserId }: MatchHistoryTableProps) {
    // Group matches by tournament, preserving order (most recent first)
    const tournamentGroups: TournamentGroup[] = [];
    let currentGroup: TournamentGroup | null = null;

    for (const match of matches) {
        if (!currentGroup || currentGroup.tournamentId !== match.tournamentId) {
            currentGroup = {
                tournamentId: match.tournamentId,
                tournamentName: match.tournamentName,
                surface: match.surface,
                matches: [],
            };
            tournamentGroups.push(currentGroup);
        }
        currentGroup.matches.push(match);
    }

    if (matches.length === 0) {
        return (
            <EmptyState>
                <EmptyText>No matches played yet.</EmptyText>
            </EmptyState>
        );
    }

    const surfaceColors: Record<string, string> = {
        Clay: "#c2410c",
        Hard: "#1d4ed8",
        Grass: "#15803d",
    };

    return (
        <TableWrapper>
            <StyledTable>
                <thead>
                <tr>
                    <Th $width="6.5rem">Date</Th>
                    <Th $width="7rem">Round</Th>
                    <Th>Winner</Th>
                    <Th>Loser</Th>
                    <Th $width="9rem">Score</Th>
                    <Th $width="3rem" $center>W/L</Th>
                    <Th $width="9rem">Tournament</Th>
                    <Th $width="4rem" $center>Surface</Th>
                </tr>
                </thead>
                <tbody>
                {tournamentGroups.map((group) => (
                    group.matches.map((match, matchIndex) => {
                        const isFirstInGroup = matchIndex === 0;
                        const isLastInGroup = matchIndex === group.matches.length - 1;
                        const groupSize = group.matches.length;

                        const formattedDate = formatDate(match.matchDate);

                        return (
                            <MatchRow
                                key={match.matchId}
                                $won={match.profilePlayerWon}
                                $isLastInGroup={isLastInGroup}
                            >
                                <Td>{formattedDate}</Td>
                                <Td>
                                    <RoundText>{match.round}</RoundText>
                                </Td>
                                <Td>
                                    <PlayerNameCell
                                        $bold={match.winnerId === profileUserId}
                                    >
                                        {match.winnerName}
                                    </PlayerNameCell>
                                </Td>
                                <Td>
                                    <PlayerNameCell
                                        $bold={match.loserId === profileUserId}
                                    >
                                        {match.loserName}
                                    </PlayerNameCell>
                                </Td>
                                <Td>
                                    <ScoreText>
                                        {match.sets.length === 0 ? (
                                            "W/O"
                                        ) : (
                                            match.sets.map((set, idx) => (
                                                <SetChunk key={idx}>
                                                    <SetScoreWrapper>
                                                        {set.winnerGames}-{set.loserGames}
                                                        {set.loserTiebreakPoints != null && (
                                                            <TiebreakSuperscript>
                                                                {set.loserTiebreakPoints}
                                                            </TiebreakSuperscript>
                                                        )}
                                                    </SetScoreWrapper>
                                                    {idx < match.sets.length - 1 && (
                                                        <SetSeparator>/</SetSeparator>
                                                    )}
                                                </SetChunk>
                                            ))
                                        )}
                                    </ScoreText>
                                </Td>
                                <Td $center>
                                    {match.profilePlayerWon ? (
                                        <CheckCircle
                                            sx={{
                                                fontSize: 18,
                                                color: colors.primary,
                                            }}
                                        />
                                    ) : (
                                        <Cancel
                                            sx={{
                                                fontSize: 18,
                                                color: colors.danger,
                                            }}
                                        />
                                    )}
                                </Td>
                                {isFirstInGroup ? (
                                    <TournamentTd rowSpan={groupSize}>
                                        <TournamentCell>
                                            <TournamentName>
                                                {group.tournamentName}
                                            </TournamentName>
                                        </TournamentCell>
                                    </TournamentTd>
                                ) : null}
                                {isFirstInGroup ? (
                                    <SurfaceTd rowSpan={groupSize} $center>
                                        <SurfaceBadge
                                            $color={
                                                surfaceColors[group.surface ?? ""] ??
                                                colors.textMuted
                                            }
                                        >
                                            {group.surface ?? "—"}
                                        </SurfaceBadge>
                                    </SurfaceTd>
                                ) : null}
                            </MatchRow>
                        );
                    })
                ))}
                </tbody>
            </StyledTable>
        </TableWrapper>
    );
}

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = String(date.getFullYear()).slice(2);
        return `${day}.${month}.${year}`;
    } catch {
        return dateStr;
    }
}

export default MatchHistoryTable;

/* ─── Styled Components ─── */

const TableWrapper = styled(Box)`
    overflow-x: auto;
    border-radius: ${radius.lg};
    border: 1px solid ${colors.border};

    &::-webkit-scrollbar {
        height: 0.4rem;
    }
    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 999px;
    }
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: ${fontSize.sm};
`;

const Th = styled.th<{ $width?: string; $center?: boolean }>`
    padding: 0.7rem 0.75rem;
    text-align: ${({ $center }) => ($center ? "center" : "left")};
    font-weight: ${fontWeight.bold};
    font-size: ${fontSize.xs};
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: ${colors.surfaceAlt};
    border-bottom: 2px solid ${colors.border};
    white-space: nowrap;
    width: ${({ $width }) => $width ?? "auto"};
`;

const MatchRow = styled.tr<{ $won: boolean; $isLastInGroup: boolean }>`
    background: ${({ $won }) => ($won ? colors.primaryLighter : "#fff")};
    border-bottom: ${({ $isLastInGroup }) =>
            $isLastInGroup ? `2px solid ${colors.border}` : `1px solid ${colors.borderLight}`};
    transition: background ${transition.fast};

    &:hover {
        background: ${({ $won }) =>
                $won ? colors.primaryLight : colors.surfaceHover};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const Td = styled.td<{ $center?: boolean }>`
    padding: 0.6rem 0.75rem;
    text-align: ${({ $center }) => ($center ? "center" : "left")};
    vertical-align: middle;
    color: ${colors.textSecondary};
    white-space: nowrap;
`;

const TournamentTd = styled.td`
    padding: 0.6rem 0.75rem;
    vertical-align: middle;
    border-left: 2px solid ${colors.border};
    background: ${colors.surfaceHover};
`;

const SurfaceTd = styled.td<{ $center?: boolean }>`
    padding: 0.6rem 0.75rem;
    vertical-align: middle;
    text-align: ${({ $center }) => ($center ? "center" : "left")};
    border-left: 1px solid ${colors.borderLight};
    background: ${colors.surfaceHover};
`;

const PlayerNameCell = styled.span<{ $bold: boolean }>`
    font-weight: ${({ $bold }) => ($bold ? fontWeight.black : fontWeight.regular)};
    color: ${({ $bold }) => ($bold ? colors.textPrimary : colors.textSecondary)};
`;

const RoundText = styled.span`
    font-size: ${fontSize.xs};
    color: ${colors.textMuted};
    font-weight: ${fontWeight.medium};
`;

const ScoreText = styled(Box)`
    display: inline-flex;
    align-items: baseline;
    flex-wrap: wrap;
    column-gap: 0.35rem;
`;

const SetChunk = styled(Box)`
    display: inline-flex;
    align-items: baseline;
    gap: 0.35rem;
`;

const SetScoreWrapper = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    font-variant-numeric: tabular-nums;
    color: ${colors.textPrimary};
`;

const TiebreakSuperscript = styled.sup`
    font-size: 0.65rem;
    font-weight: ${fontWeight.bold};
    line-height: 1;
    vertical-align: super;
    color: ${colors.textSecondary};
`;

const SetSeparator = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textHint};
`;

const TournamentCell = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const TournamentName = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    line-height: 1.3 !important;
`;

const SurfaceBadge = styled.span<{ $color: string }>`
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    color: ${({ $color }) => $color};
    writing-mode: vertical-rl;
    text-orientation: mixed;
    letter-spacing: 0.04em;
    text-transform: capitalize;
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