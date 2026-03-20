import { Search } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import type {
    LeaderboardLevel,
    LeaderboardPlayer,
    LeaderboardResponse,
} from "../types/leaderboard";

const levels: LeaderboardLevel[] = [
    "ENTRY",
    "STARTER",
    "MEDIUM",
    "MASTER",
    "EXPERT",
    "STELLAR",
];

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
        <AuthenticatedLayout>
            <PageWrapper>
                <HeaderSection>
                    <PageTitle>Leaderboard</PageTitle>
                    <PageSubtitle>
                        Explore the rankings for each player level and track performance
                        across the tennis community.
                    </PageSubtitle>
                </HeaderSection>

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
                            <Search sx={{ fontSize: 18 }} />
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
                                    <th>Rank</th>
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
                                            <td>{player.rank}</td>
                                            <td>{player.fullName}</td>
                                            <td>{player.wins}</td>
                                            <td>{player.losses}</td>
                                            <td>{player.winRate}%</td>
                                            <td>{player.points}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </StyledTable>

                            <PaginationRow>
                                <PaginationButton
                                    onClick={() => setPage((previous) => Math.max(previous - 1, 0))}
                                    disabled={page === 0}
                                >
                                    Previous
                                </PaginationButton>

                                <PaginationInfo>
                                    Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                                </PaginationInfo>

                                <PaginationButton
                                    onClick={() =>
                                        setPage((previous) =>
                                            totalPages === 0 ? previous : Math.min(previous + 1, totalPages - 1)
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
    );
}

export default LeaderboardPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
`;

const HeaderSection = styled(Box)`
  margin-bottom: 1.25rem;
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.35rem !important;
`;

const PageSubtitle = styled(Typography)`
  color: #64748b;
  font-size: 0.98rem !important;
  line-height: 1.6 !important;
`;

const ControlsCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1.1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

const LevelsRow = styled(Box)`
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const LevelButton = styled.button<{ $active: boolean }>`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#10b981" : "#f1f5f9")};
  color: ${({ $active }) => ($active ? "white" : "#334155")};
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: ${({ $active }) => ($active ? "#059669" : "#e2e8f0")};
  }
`;

const SearchRow = styled(Box)`
  display: flex;
  gap: 0.75rem;
  align-items: center;

  @media (max-width: 48rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchInputWrapper = styled(Box)`
  flex: 1;
  height: 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #64748b;
`;

const SearchInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.94rem;
  background: transparent;
`;

const SearchButton = styled.button`
  height: 3rem;
  padding: 0 1.2rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;

const TableCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    text-align: left;
    padding: 0.9rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    font-size: 0.93rem;
  }

  th {
    color: #475569;
    font-weight: 800;
  }

  td {
    color: #111827;
    font-weight: 500;
  }
`;

const EmptyCell = styled.td`
  text-align: center !important;
  color: #64748b !important;
  padding: 2rem 0.75rem !important;
`;

const PaginationRow = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  gap: 1rem;

  @media (max-width: 40rem) {
    flex-direction: column;
  }
`;

const PaginationInfo = styled(Typography)`
  color: #64748b;
  font-size: 0.9rem !important;
`;

const PaginationButton = styled.button`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #e2e8f0;
  }

  &:disabled {
    background: #e5e7eb;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;