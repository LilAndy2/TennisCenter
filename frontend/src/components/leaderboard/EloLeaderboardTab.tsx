import { Search } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../../api/axiosInstance";
import { AnimatedCounter } from "../animated";
import type { EloLeaderboardEntry, EloLeaderboardResponse } from "../../types/eloLeaderboard";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../../styles/theme";

const medalColors: Record<number, string> = {
    1: "#f59e0b",
    2: "#94a3b8",
    3: "#d97706",
};

function EloLeaderboardTab() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [players, setPlayers] = useState<EloLeaderboardEntry[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get<EloLeaderboardResponse>(
                "/player/elo-leaderboard",
                { params: { search, page, size } }
            );
            setPlayers(res.data.content);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error("Failed to load Elo leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, [page]);

    const handleSearch = () => {
        setPage(0);
        loadLeaderboard();
    };

    return (
        <>
            <ControlsCard>
                <InfoBanner>
                    <InfoTitle>What is Elo?</InfoTitle>
                    <InfoText>
                        The Elo system measures true skill across all levels. Unlike level-based points,
                        Elo adjusts dynamically — beating a higher-rated player earns more points,
                        while losing to a lower-rated player costs more. Dominant wins count extra.
                    </InfoText>
                </InfoBanner>

                <SearchRow>
                    <SearchInputWrapper>
                        <Search sx={{ fontSize: 18, color: colors.textHint }} />
                        <SearchInput
                            placeholder="Search players by name or username"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSearch();
                            }}
                        />
                    </SearchInputWrapper>
                    <SearchButton onClick={handleSearch}>Search</SearchButton>
                </SearchRow>
            </ControlsCard>

            <TableCard>
                {loading ? (
                    <LoadingBox>
                        <CircularProgress />
                    </LoadingBox>
                ) : (
                    <>
                        <StyledTable>
                            <thead>
                            <tr>
                                <th style={{ width: "4rem" }}>Rank</th>
                                <th>Player</th>
                                <th>Level</th>
                                <th>Elo</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Win Rate</th>
                            </tr>
                            </thead>
                            <tbody>
                            {players.length === 0 ? (
                                <tr>
                                    <EmptyCell colSpan={7}>No players found.</EmptyCell>
                                </tr>
                            ) : (
                                players.map((player) => (
                                    <tr
                                        key={player.id}
                                        onClick={() => navigate(`/profile/${player.id}`)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>
                                            <RankCell>
                                                {player.rank <= 3 ? (
                                                    <MedalBadge $color={medalColors[player.rank]}>
                                                        {player.rank}
                                                    </MedalBadge>
                                                ) : (
                                                    <span className="tabular-nums">{player.rank}</span>
                                                )}
                                            </RankCell>
                                        </td>
                                        <td>
                                            <PlayerNameCell>{player.fullName}</PlayerNameCell>
                                        </td>
                                        <td>
                                            <LevelBadge>{player.level}</LevelBadge>
                                        </td>
                                        <td className="tabular-nums">
                                            <EloValue>
                                                <AnimatedCounter value={player.eloRating} />
                                            </EloValue>
                                        </td>
                                        <td className="tabular-nums">{player.wins}</td>
                                        <td className="tabular-nums">{player.losses}</td>
                                        <td className="tabular-nums">
                                            <AnimatedCounter value={player.winRate} suffix="%" />
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </StyledTable>

                        <PaginationRow>
                            <PaginationButton
                                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                                disabled={page === 0}
                            >
                                Previous
                            </PaginationButton>
                            <PaginationInfo>
                                Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                            </PaginationInfo>
                            <PaginationButton
                                onClick={() =>
                                    setPage((prev) =>
                                        totalPages === 0 ? prev : Math.min(prev + 1, totalPages - 1)
                                    )
                                }
                                disabled={totalPages === 0 || page >= totalPages - 1}
                            >
                                Next
                            </PaginationButton>
                        </PaginationRow>
                    </>
                )}
            </TableCard>
        </>
    );
}

export default EloLeaderboardTab;

// ── Styled Components ──

const ControlsCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    margin-bottom: ${spacing.md};
    box-shadow: ${shadow.sm};
`;

const InfoBanner = styled(Box)`
    padding: ${spacing.md};
    background: ${colors.backgroundGreen};
    border: 1px solid ${colors.borderGreen};
    border-radius: ${radius.lg};
    margin-bottom: ${spacing.md};
`;

const InfoTitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 800 !important;
    color: ${colors.primaryDark};
    margin-bottom: 0.2rem !important;
`;

const InfoText = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textSecondary};
    line-height: 1.5 !important;
`;

const SearchRow = styled(Box)`
    display: flex;
    gap: ${spacing.sm};
    align-items: center;
`;

const SearchInputWrapper = styled(Box)`
    flex: 1;
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    padding: 0 ${spacing.md};
    height: 2.75rem;
    background: ${colors.surfaceAlt};
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    transition: border-color ${transition.normal};

    &:focus-within {
        border-color: ${colors.primary};
    }
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    &::placeholder {
        color: ${colors.textHint};
    }
`;

const SearchButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.lg};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: background ${transition.normal};
    &:hover {
        background: ${colors.primaryHover};
    }
`;

const TableCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    overflow: hidden;
    box-shadow: ${shadow.sm};
`;

const LoadingBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th {
        text-align: left;
        padding: ${spacing.sm} ${spacing.md};
        font-size: ${fontSize.xs};
        font-weight: 800;
        color: ${colors.textMuted};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        border-bottom: 2px solid ${colors.border};
    }

    td {
        padding: ${spacing.sm} ${spacing.md};
        font-size: ${fontSize.sm};
        color: ${colors.textPrimary};
        border-bottom: 1px solid ${colors.borderLight};
    }

    tbody tr {
        transition: background ${transition.fast};
        &:hover {
            background: ${colors.surfaceHover};
        }
    }
`;

const EmptyCell = styled.td`
    text-align: center !important;
    color: ${colors.textMuted} !important;
    padding: ${spacing.xl} !important;
    font-style: italic;
`;

const RankCell = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: ${fontWeight.bold};
    font-variant-numeric: tabular-nums;
`;

const MedalBadge = styled(Box)<{ $color: string }>`
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${fontSize.xs};
    font-weight: 900;
    color: white;
    background: ${({ $color }) => $color};
`;

const PlayerNameCell = styled(Box)`
    font-weight: ${fontWeight.bold};
`;

const LevelBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 0.1rem 0.5rem;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
`;

const EloValue = styled.span`
    font-weight: 900;
    color: ${colors.primary};
`;

const PaginationRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${spacing.md};
    padding: ${spacing.md};
    border-top: 1px solid ${colors.borderLight};
`;

const PaginationButton = styled.button<{ disabled?: boolean }>`
    padding: ${spacing.xs} ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    background: ${({ disabled }) => (disabled ? colors.surfaceAlt : colors.surface)};
    color: ${({ disabled }) => (disabled ? colors.textHint : colors.textPrimary)};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
    transition: all ${transition.normal};
    &:hover:not(:disabled) {
        background: ${colors.surfaceHover};
    }
`;

const PaginationInfo = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
`;