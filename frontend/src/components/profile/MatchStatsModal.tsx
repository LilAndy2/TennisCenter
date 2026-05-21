import { Close } from "@mui/icons-material";
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../api/axiosInstance";
import type { MatchStats } from "../../types/liveScoring";
import {
    colors,
    spacing,
    fontSize,
    radius,
} from "../../styles/theme";

type MatchStatsModalProps = {
    open: boolean;
    matchId: number | null;
    onClose: () => void;
};

function MatchStatsModal({ open, matchId, onClose }: MatchStatsModalProps) {
    const [stats, setStats] = useState<MatchStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && matchId) {
            setLoading(true);
            setError("");
            axiosInstance
                .get<MatchStats>(`/matches/${matchId}/stats`)
                .then((res) => setStats(res.data))
                .catch(() => setError("Failed to load stats"))
                .finally(() => setLoading(false));
        } else {
            setStats(null);
        }
    }, [open, matchId]);

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContentWrapper>
                <HeaderRow>
                    <HeaderTitle>Match Statistics</HeaderTitle>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </HeaderRow>

                {loading ? (
                    <LoadingBox>
                        <CircularProgress size={32} />
                    </LoadingBox>
                ) : error ? (
                    <ErrorText>{error}</ErrorText>
                ) : stats ? (
                    <>
                        <PlayersHeader>
                            <PlayerHeaderName $align="left">{stats.playerOneName}</PlayerHeaderName>
                            <VsLabel>vs</VsLabel>
                            <PlayerHeaderName $align="right">{stats.playerTwoName}</PlayerHeaderName>
                        </PlayersHeader>

                        <StatsTable>
                            <tbody>
                            {/* Serve Stats */}
                            <SectionRow>
                                <td colSpan={3}>Serve</td>
                            </SectionRow>
                            <StatRow
                                label="Aces"
                                p1={String(stats.playerOneAces)}
                                p2={String(stats.playerTwoAces)}
                            />
                            <StatRow
                                label="Double Faults"
                                p1={String(stats.playerOneDoubleFaults)}
                                p2={String(stats.playerTwoDoubleFaults)}
                            />
                            <StatRow
                                label="1st Serve %"
                                p1={stats.playerOneFirstServePercentage}
                                p2={stats.playerTwoFirstServePercentage}
                            />
                            <StatRow
                                label="1st Serve Points Won"
                                p1={stats.playerOneFirstServePointsWon}
                                p2={stats.playerTwoFirstServePointsWon}
                            />
                            <StatRow
                                label="2nd Serve Points Won"
                                p1={stats.playerOneSecondServePointsWon}
                                p2={stats.playerTwoSecondServePointsWon}
                            />

                            {/* Return Stats */}
                            <SectionRow>
                                <td colSpan={3}>Return</td>
                            </SectionRow>
                            <StatRow
                                label="Receiving Points Won"
                                p1={stats.playerOneReceivingPointsWon}
                                p2={stats.playerTwoReceivingPointsWon}
                            />
                            <StatRow
                                label="Break Points Won"
                                p1={stats.playerOneBreakPointsWon}
                                p2={stats.playerTwoBreakPointsWon}
                            />

                            {/* Points */}
                            <SectionRow>
                                <td colSpan={3}>Points</td>
                            </SectionRow>
                            <StatRow
                                label="Service Games Won"
                                p1={stats.playerOneServiceGamesWon}
                                p2={stats.playerTwoServiceGamesWon}
                            />
                            <StatRow
                                label="Net Points Won"
                                p1={stats.playerOneNetPointsWon}
                                p2={stats.playerTwoNetPointsWon}
                            />

                            {/* Winners */}
                            <SectionRow>
                                <td colSpan={3}>Winners</td>
                            </SectionRow>
                            <StatRow
                                label="Forehand Winners"
                                p1={String(stats.playerOneForehandWinners)}
                                p2={String(stats.playerTwoForehandWinners)}
                            />
                            <StatRow
                                label="Backhand Winners"
                                p1={String(stats.playerOneBackhandWinners)}
                                p2={String(stats.playerTwoBackhandWinners)}
                            />
                            <StatRow
                                label="Volley Winners"
                                p1={String(stats.playerOneVolleyWinners)}
                                p2={String(stats.playerTwoVolleyWinners)}
                            />
                            <StatRow
                                label="Total Winners"
                                p1={String(stats.playerOneTotalWinners)}
                                p2={String(stats.playerTwoTotalWinners)}
                                bold
                            />

                            {/* Errors */}
                            <SectionRow>
                                <td colSpan={3}>Errors</td>
                            </SectionRow>
                            <StatRow
                                label="FH Unforced Errors"
                                p1={String(stats.playerOneForehandUnforcedErrors)}
                                p2={String(stats.playerTwoForehandUnforcedErrors)}
                            />
                            <StatRow
                                label="BH Unforced Errors"
                                p1={String(stats.playerOneBackhandUnforcedErrors)}
                                p2={String(stats.playerTwoBackhandUnforcedErrors)}
                            />
                            <StatRow
                                label="Total Unforced Errors"
                                p1={String(stats.playerOneTotalUnforcedErrors)}
                                p2={String(stats.playerTwoTotalUnforcedErrors)}
                                bold
                            />
                            <StatRow
                                label="Forced Errors"
                                p1={String(stats.playerOneForcedErrors)}
                                p2={String(stats.playerTwoForcedErrors)}
                            />

                            {/* Totals */}
                            <SectionRow>
                                <td colSpan={3}>Totals</td>
                            </SectionRow>
                            <StatRow
                                label="Total Points Won"
                                p1={String(stats.playerOneTotalPointsWon)}
                                p2={String(stats.playerTwoTotalPointsWon)}
                                bold
                                highlight
                            />
                            </tbody>
                        </StatsTable>
                    </>
                ) : null}
            </DialogContentWrapper>
        </StyledDialog>
    );
}

// ─── Stat Row sub-component ───

function StatRow({
                     label,
                     p1,
                     p2,
                     bold,
                     highlight,
                 }: {
    label: string;
    p1: string;
    p2: string;
    bold?: boolean;
    highlight?: boolean;
}) {
    return (
        <DataRow $highlight={highlight}>
            <ValueTd $align="left" $bold={bold}>{p1}</ValueTd>
            <LabelTd $bold={bold}>{label}</LabelTd>
            <ValueTd $align="right" $bold={bold}>{p2}</ValueTd>
        </DataRow>
    );
}

export default MatchStatsModal;

// ─── Styled Components ───

const StyledDialog = styled(Dialog)`
    .MuiPaper-root {
        border-radius: ${radius.xl} !important;
        overflow: hidden;
    }
`;

const DialogContentWrapper = styled(DialogContent)`
    padding: ${spacing.lg} !important;
`;

const HeaderRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
`;

const HeaderTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
`;

const LoadingBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const ErrorText = styled(Typography)`
    text-align: center;
    color: ${colors.danger};
    padding: ${spacing.lg};
`;

const PlayersHeader = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    margin-bottom: ${spacing.md};
    padding: 0.6rem 0.75rem;
    background: linear-gradient(135deg, #064e3b, #065f46);
    border-radius: ${radius.md};
`;

const PlayerHeaderName = styled(Typography)<{ $align: "left" | "right" }>`
    flex: 1;
    font-size: ${fontSize.sm} !important;
    font-weight: 800 !important;
    color: white !important;
    text-align: ${({ $align }) => $align};
`;

const VsLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: rgba(255, 255, 255, 0.5) !important;
    font-weight: 700 !important;
`;

const StatsTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const SectionRow = styled.tr`
    td {
        padding: 0.5rem 0.75rem 0.3rem;
        font-size: ${fontSize.xs};
        font-weight: 800;
        color: ${colors.primary};
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border-bottom: 2px solid ${colors.borderGreen};
    }
`;

const DataRow = styled.tr<{ $highlight?: boolean }>`
    background: ${({ $highlight }) => ($highlight ? "#ecfdf5" : "transparent")};

    &:hover {
        background: ${colors.surfaceHover};
    }

    td {
        border-bottom: 1px solid ${colors.borderLight};
    }
`;

const LabelTd = styled.td<{ $bold?: boolean }>`
    padding: 0.45rem 0.5rem;
    text-align: center;
    font-size: ${fontSize.xs};
    font-weight: ${({ $bold }) => ($bold ? 800 : 600)};
    color: ${colors.textSecondary};
    white-space: nowrap;
`;

const ValueTd = styled.td<{ $align: "left" | "right"; $bold?: boolean }>`
    padding: 0.45rem 0.75rem;
    text-align: ${({ $align }) => $align};
    font-size: ${fontSize.sm};
    font-weight: ${({ $bold }) => ($bold ? 800 : 600)};
    color: ${({ $bold }) => ($bold ? colors.textPrimary : colors.textSecondary)};
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
`;