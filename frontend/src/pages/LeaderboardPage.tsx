import { Search } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import { AnimatedCounter } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
    LoadingWrapper,
} from "../components/common/PageLayout";
import type {
    LeaderboardLevel,
    LeaderboardPlayer,
    LeaderboardResponse,
} from "../types/leaderboard";
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

const levels: LeaderboardLevel[] = [
    "ENTRY",
    "STARTER",
    "MEDIUM",
    "MASTER",
    "EXPERT",
    "STELLAR",
];

const medalColors: Record<number, string> = {
    1: "#f59e0b", // gold
    2: "#94a3b8", // silver
    3: "#d97706", // bronze
};

function LeaderboardPage() {
    const [selectedLevel, setSelectedLevel] = useState<LeaderboardLevel>("ENTRY");
    const [search, setSearch] = useState("");
    const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
    const [page, setPage] = useState(0);
    const [size] = useState(8);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadLeaderboard = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get<LeaderboardResponse>(
                "/player/leaderboard",
                {
                    params: {
                        level: selectedLevel,
                        search,
                        page,
                        size,
                    },
                }
            );

            setPlayers(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Failed to load leaderboard", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLeaderboard();
    }, [selectedLevel, page]);

    const handleSearch = () => {
        setPage(0);
        loadLeaderboard();
    };

    const handleLevelChange = (level: LeaderboardLevel) => {
        setSelectedLevel(level);
        setPage(0);
    };

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>Leaderboard</PageTitle>
                        <PageSubtitle>
                            Explore the rankings for each player level and track performance
                            across the tennis community.
                        </PageSubtitle>
                    </PageHeader>

                    <ControlsCard>
                        <LevelsRow>
                            {levels.map((level) => (
                                <LevelButton
                                    key={level}
                                    $active={selectedLevel === level}
                                    onClick={() => handleLevelChange(level)}
                                >
                                    {level.charAt(0) + level.slice(1).toLowerCase()}
                                </LevelButton>
                            ))}
                        </LevelsRow>

                        <SearchRow>
                            <SearchInputWrapper>
                                <Search sx={{ fontSize: 18, color: colors.textHint }} />
                                <SearchInput
                                    placeholder="Search players by name, username or email"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            handleSearch();
                                        }
                                    }}
                                />
                            </SearchInputWrapper>

                            <SearchButton onClick={handleSearch}>Search</SearchButton>
                        </SearchRow>
                    </ControlsCard>

                    <TableCard>
                        {loading ? (
                            <LoadingWrapper>
                                <CircularProgress />
                            </LoadingWrapper>
                        ) : (
                            <>
                                <StyledTable>
                                    <thead>
                                    <tr>
                                        <th style={{ width: "4rem" }}>Rank</th>
                                        <th>Player</th>
                                        <th>Wins</th>
                                        <th>Losses</th>
                                        <th>Win Rate</th>
                                        <th>Points</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {players.length === 0 ? (
                                        <tr>
                                            <EmptyCell colSpan={6}>No players found.</EmptyCell>
                                        </tr>
                                    ) : (
                                        players.map((player) => (
                                            <tr key={player.id}>
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
                                                <td className="tabular-nums">{player.wins}</td>
                                                <td className="tabular-nums">{player.losses}</td>
                                                <td className="tabular-nums">
                                                    <AnimatedCounter value={player.winRate} suffix="%" />
                                                </td>
                                                <td className="tabular-nums">
                                                    <strong>
                                                        <AnimatedCounter value={player.points} suffix=" pts" />
                                                    </strong>
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
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default LeaderboardPage;

/* ─── Styled Components ─── */

const PageWrapper = styled(BasePageWrapper)`
    max-width: 80rem;
`;

const ControlsCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    margin-bottom: ${spacing.md};
    box-shadow: ${shadow.sm};
`;

const LevelsRow = styled(Box)`
    display: flex;
    gap: ${spacing.xs};
    flex-wrap: wrap;
    margin-bottom: ${spacing.md};
`;

const LevelButton = styled.button<{ $active: boolean }>`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${({ $active }) => ($active ? colors.primary : colors.surfaceAlt)};
    color: ${({ $active }) => ($active ? "white" : colors.textSecondary)};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryHover : colors.surfaceAltHover)};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const SearchRow = styled(Box)`
    display: flex;
    gap: ${spacing.sm};
    align-items: center;

    @media (max-width: ${breakpoints.md}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchInputWrapper = styled(Box)`
    flex: 1;
    height: 2.85rem;
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    padding: 0 ${spacing.md};
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    transition: border-color ${transition.normal};

    &:focus-within {
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
    }
`;

const SearchInput = styled.input`
    width: 100%;
    border: none;
    outline: none;
    font-size: ${fontSize.sm};
    background: transparent;
    color: ${colors.textPrimary};

    &::placeholder {
        color: ${colors.textHint};
    }
`;

const SearchButton = styled.button`
    height: 2.85rem;
    padding: 0 ${spacing.lg};
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
    }

    &:active {
        transform: scale(0.97);
    }
`;

const TableCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.md};
    box-shadow: ${shadow.sm};
    overflow-x: auto;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        text-align: left;
        padding: ${spacing.sm} ${spacing.sm};
        border-bottom: 1px solid ${colors.border};
        font-size: ${fontSize.sm};
    }

    th {
        color: ${colors.textSecondary};
        font-weight: ${fontWeight.black};
        font-size: ${fontSize.xs};
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }

    td {
        color: ${colors.textPrimary};
        font-weight: ${fontWeight.medium};
    }

    tbody tr {
        transition: background ${transition.fast};
    }

    tbody tr:hover {
        background: ${colors.surfaceHover};
    }

    tbody tr:last-child td {
        border-bottom: none;
    }
`;

const RankCell = styled(Box)`
    display: flex;
    align-items: center;
`;

const MedalBadge = styled.span<{ $color: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    background: ${({ $color }) => $color}18;
    color: ${({ $color }) => $color};
    font-weight: ${fontWeight.black};
    font-size: ${fontSize.xs};
    border: 1.5px solid ${({ $color }) => $color}40;
`;

const PlayerNameCell = styled.span`
    font-weight: ${fontWeight.bold};
`;

const EmptyCell = styled.td`
    text-align: center !important;
    color: ${colors.textMuted} !important;
    padding: ${spacing.xl} ${spacing.sm} !important;
`;

const PaginationRow = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: ${spacing.md};
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.sm}) {
        flex-direction: column;
    }
`;

const PaginationInfo = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.sm} !important;
`;

const PaginationButton = styled.button`
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

    &:hover:not(:disabled) {
        background: ${colors.surfaceAltHover};
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        background: ${colors.surfaceAlt};
        color: ${colors.textHint};
        cursor: not-allowed;
        opacity: 0.6;
    }
`;