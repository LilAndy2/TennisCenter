import { Add, Close, PersonRemove, Search, SportsScore } from "@mui/icons-material";
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import useAdminPlayers from "../../hooks/useAdminPlayers";
import type { AdminPlayer, PlayerLevel } from "../../hooks/useAdminPlayers";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../../styles/theme";

type SubTab = "players" | "umpires";

const levelOrder: PlayerLevel[] = ["ENTRY", "STARTER", "MEDIUM", "MASTER", "EXPERT", "STELLAR"];

function PlayersManagementSection() {
    const [activeTab, setActiveTab] = useState<SubTab>("players");
    const hook = useAdminPlayers();

    return (
        <Wrapper>
            <Header>
                <SectionTitle>Players &amp; Umpires</SectionTitle>
            </Header>

            <TabsRow>
                <TabButton $active={activeTab === "players"} onClick={() => setActiveTab("players")}>
                    Players
                </TabButton>
                <TabButton $active={activeTab === "umpires"} onClick={() => setActiveTab("umpires")}>
                    Umpires
                </TabButton>
            </TabsRow>

            {activeTab === "players" ? <PlayersSubTab hook={hook} /> : <UmpiresSubTab hook={hook} />}
        </Wrapper>
    );
}

export default PlayersManagementSection;

/* ─── Players Sub-Tab ─── */

function PlayersSubTab({ hook }: { hook: ReturnType<typeof useAdminPlayers> }) {
    const {
        levels,
        selectedLevel,
        setSelectedLevel,
        playerSearch,
        setPlayerSearch,
        players,
        playersLoading,
        handlePlayerSearch,
        handleChangeLevel,
    } = hook;

    return (
        <>
            <LevelsRow>
                {levels.map((level) => (
                    <LevelPill
                        key={level}
                        $active={selectedLevel === level}
                        onClick={() => setSelectedLevel(level)}
                    >
                        {level.charAt(0) + level.slice(1).toLowerCase()}
                    </LevelPill>
                ))}
            </LevelsRow>

            <SearchRow>
                <SearchWrapper>
                    <Search sx={{ fontSize: 18, color: colors.textHint }} />
                    <SearchInput
                        placeholder="Search by name, username or email..."
                        value={playerSearch}
                        onChange={(e) => setPlayerSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handlePlayerSearch();
                        }}
                    />
                </SearchWrapper>
                <SmallActionButton onClick={handlePlayerSearch}>Search</SmallActionButton>
            </SearchRow>

            {playersLoading ? (
                <LoadingBox><CircularProgress size={28} /></LoadingBox>
            ) : (
                <TableContainer>
                    <StyledTable>
                        <thead>
                        <tr>
                            <th>Player</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Level</th>
                            <th>W / L</th>
                            <th>Points</th>
                            <th style={{ width: "10rem", textAlign: "center" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {players.length === 0 ? (
                            <tr>
                                <EmptyCell colSpan={7}>No players found for this level.</EmptyCell>
                            </tr>
                        ) : (
                            players.map((player) => (
                                <PlayerRow
                                    key={player.id}
                                    player={player}
                                    currentLevel={selectedLevel}
                                    onChangeLevel={handleChangeLevel}
                                />
                            ))
                        )}
                        </tbody>
                    </StyledTable>
                </TableContainer>
            )}
        </>
    );
}

/* ─── Single Player Row ─── */

function PlayerRow({
                       player,
                       currentLevel,
                       onChangeLevel,
                   }: {
    player: AdminPlayer;
    currentLevel: PlayerLevel;
    onChangeLevel: (userId: number, newLevel: string) => void;
}) {
    const currentIndex = levelOrder.indexOf(currentLevel);
    const canPromote = currentIndex < levelOrder.length - 1;
    const canDemote = currentIndex > 0;

    return (
        <tr>
            <td><PlayerName>{player.fullName}</PlayerName></td>
            <td>{player.username}</td>
            <td><EmailText>{player.email}</EmailText></td>
            <td><LevelBadge>{player.playerLevel}</LevelBadge></td>
            <td>{player.wins} / {player.losses}</td>
            <td><PointsBadge>{player.rankingPoints}</PointsBadge></td>
            <td>
                <ActionsCell>
                    {canDemote && (
                        <DemoteButton onClick={() => onChangeLevel(player.id, levelOrder[currentIndex - 1])}>
                            Demote
                        </DemoteButton>
                    )}
                    {canPromote && (
                        <PromoteButton onClick={() => onChangeLevel(player.id, levelOrder[currentIndex + 1])}>
                            Promote
                        </PromoteButton>
                    )}
                </ActionsCell>
            </td>
        </tr>
    );
}

/* ─── Umpires Sub-Tab ─── */

function UmpiresSubTab({ hook }: { hook: ReturnType<typeof useAdminPlayers> }) {
    const {
        umpireSearch,
        setUmpireSearch,
        umpires,
        umpiresLoading,
        handleUmpireSearch,
        handleRemoveUmpire,
        isAddUmpireOpen,
        setIsAddUmpireOpen,
        umpireCandidates,
        umpireCandidatesLoading,
        searchUmpireCandidates,
        handleAddUmpire,
    } = hook;

    return (
        <>
            <SearchRow>
                <SearchWrapper>
                    <Search sx={{ fontSize: 18, color: colors.textHint }} />
                    <SearchInput
                        placeholder="Search umpires..."
                        value={umpireSearch}
                        onChange={(e) => setUmpireSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleUmpireSearch();
                        }}
                    />
                </SearchWrapper>
                <SmallActionButton onClick={handleUmpireSearch}>Search</SmallActionButton>
                <AddUmpireButton onClick={() => setIsAddUmpireOpen(true)}>
                    <Add sx={{ fontSize: 18 }} />
                    <span>Add umpire</span>
                </AddUmpireButton>
            </SearchRow>

            {umpiresLoading ? (
                <LoadingBox><CircularProgress size={28} /></LoadingBox>
            ) : (
                <TableContainer>
                    <StyledTable>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Also a player?</th>
                            <th style={{ width: "8rem", textAlign: "center" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {umpires.length === 0 ? (
                            <tr>
                                <EmptyCell colSpan={5}>No umpires found.</EmptyCell>
                            </tr>
                        ) : (
                            umpires.map((umpire) => (
                                <tr key={umpire.id}>
                                    <td><PlayerName>{umpire.fullName}</PlayerName></td>
                                    <td>{umpire.username}</td>
                                    <td><EmailText>{umpire.email}</EmailText></td>
                                    <td>
                                        {umpire.roles.includes("PLAYER") ? (
                                            <LevelBadge>{umpire.playerLevel ?? "Yes"}</LevelBadge>
                                        ) : (
                                            <MutedText>No</MutedText>
                                        )}
                                    </td>
                                    <td>
                                        <ActionsCell>
                                            <RemoveUmpireButton onClick={() => handleRemoveUmpire(umpire.id)}>
                                                <PersonRemove sx={{ fontSize: 15 }} />
                                                <span>Remove</span>
                                            </RemoveUmpireButton>
                                        </ActionsCell>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </StyledTable>
                </TableContainer>
            )}

            <AddUmpireDialog
                open={isAddUmpireOpen}
                onClose={() => setIsAddUmpireOpen(false)}
                candidates={umpireCandidates}
                loading={umpireCandidatesLoading}
                onSearch={searchUmpireCandidates}
                onAdd={handleAddUmpire}
            />
        </>
    );
}

/* ─── Add Umpire Dialog ─── */

function AddUmpireDialog({
                             open,
                             onClose,
                             candidates,
                             loading,
                             onSearch,
                             onAdd,
                         }: {
    open: boolean;
    onClose: () => void;
    candidates: AdminPlayer[];
    loading: boolean;
    onSearch: (query: string) => void;
    onAdd: (userId: number) => void;
}) {
    const [query, setQuery] = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!open) {
            setQuery("");
            return;
        }
    }, [open]);

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            onSearch(value);
        }, 300);
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <ModalContent>
                <ModalHeaderRow>
                    <ModalTitle>Add Umpire</ModalTitle>
                    <IconButton onClick={onClose} size="small">
                        <Close sx={{ fontSize: 20 }} />
                    </IconButton>
                </ModalHeaderRow>

                <ModalSearchWrapper>
                    <Search sx={{ fontSize: 18, color: colors.textHint }} />
                    <ModalSearchInput
                        autoFocus
                        placeholder="Search players by name or username..."
                        value={query}
                        onChange={(e) => handleChange(e.target.value)}
                    />
                </ModalSearchWrapper>

                <CandidatesList>
                    {loading ? (
                        <LoadingBox><CircularProgress size={24} /></LoadingBox>
                    ) : !query.trim() ? (
                        <HintText>Start typing to search for players</HintText>
                    ) : candidates.length === 0 ? (
                        <HintText>No players found matching your search</HintText>
                    ) : (
                        candidates.map((c) => (
                            <CandidateRow key={c.id}>
                                <CandidateInfo>
                                    <CandidateName>{c.fullName}</CandidateName>
                                    <CandidateMeta>@{c.username} · {c.playerLevel}</CandidateMeta>
                                </CandidateInfo>
                                <AddCandidateButton onClick={() => onAdd(c.id)}>
                                    <SportsScore sx={{ fontSize: 16 }} />
                                    <span>Add</span>
                                </AddCandidateButton>
                            </CandidateRow>
                        ))
                    )}
                </CandidatesList>
            </ModalContent>
        </StyledDialog>
    );
}

/* ─── Styled Components ─── */

const Wrapper = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    box-shadow: ${shadow.sm};
    overflow: hidden;
`;

const Header = styled(Box)`
    padding: ${spacing.lg} ${spacing.lg} 0 ${spacing.lg};
`;

const SectionTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const TabsRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    background: #ecfdf5;
    border-radius: 0.65rem;
    padding: 0.25rem;
    margin: ${spacing.md} ${spacing.lg};
    max-width: 18rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
    height: 2.6rem;
    border-radius: 0.5rem;
    border: ${({ $active }) => ($active ? "1px solid #a7f3d0" : "1px solid transparent")};
    background: ${({ $active }) => ($active ? "#ffffff" : "transparent")};
    color: ${({ $active }) => ($active ? "#047857" : "#64748b")};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: 0.15s ease;
`;

const LevelsRow = styled(Box)`
    display: flex;
    gap: ${spacing.xs};
    flex-wrap: wrap;
    padding: 0 ${spacing.lg};
    margin-bottom: ${spacing.sm};
`;

const LevelPill = styled.button<{ $active: boolean }>`
    height: 2.25rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${({ $active }) => ($active ? colors.primary : colors.surfaceAlt)};
    color: ${({ $active }) => ($active ? "white" : colors.textSecondary)};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryHover : colors.surfaceAltHover)};
    }
`;

const SearchRow = styled(Box)`
    display: flex;
    gap: ${spacing.sm};
    align-items: center;
    padding: 0 ${spacing.lg};
    margin-bottom: ${spacing.md};

    @media (max-width: ${breakpoints.sm}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SearchWrapper = styled(Box)`
    flex: 1;
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    height: 2.5rem;
    padding: 0 ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    background: ${colors.surfaceHover};
    transition: border-color ${transition.normal};
    min-width: 14rem;

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

const SmallActionButton = styled.button`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};
    white-space: nowrap;

    &:hover {
        background: ${colors.primaryHover};
    }
`;

const AddUmpireButton = styled.button`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    transition: all ${transition.normal};
    white-space: nowrap;

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }
`;

const LoadingBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const TableContainer = styled(Box)`
    overflow-x: auto;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        text-align: left;
        padding: ${spacing.sm} ${spacing.md};
        border-bottom: 1px solid ${colors.border};
        font-size: ${fontSize.sm};
    }

    th {
        color: ${colors.textSecondary};
        font-weight: ${fontWeight.black};
        font-size: ${fontSize.xs};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: ${colors.surfaceHover};
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

const EmptyCell = styled.td`
    text-align: center !important;
    color: ${colors.textMuted} !important;
    padding: ${spacing.xl} ${spacing.md} !important;
`;

const PlayerName = styled.span`
    font-weight: ${fontWeight.bold};
    color: ${colors.textPrimary};
`;

const EmailText = styled.span`
    color: ${colors.textSecondary};
    font-size: ${fontSize.xs};
`;

const MutedText = styled.span`
    color: ${colors.textMuted};
    font-size: ${fontSize.xs};
`;

const LevelBadge = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 0.15rem 0.55rem;
    border-radius: ${radius.pill};
    background: ${colors.primaryLighter};
    color: ${colors.primaryDark};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
`;

const PointsBadge = styled.span`
    font-weight: ${fontWeight.bold};
    color: ${colors.textPrimary};
`;

const ActionsCell = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
`;

const PromoteButton = styled.button`
    height: 2rem;
    padding: 0 0.65rem;
    border: none;
    border-radius: ${radius.pill};
    background: #ecfdf5;
    color: #047857;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: #d1fae5;
    }
`;

const DemoteButton = styled.button`
    height: 2rem;
    padding: 0 0.65rem;
    border: none;
    border-radius: ${radius.pill};
    background: #fef2f2;
    color: #b91c1c;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: #fee2e2;
    }
`;

const RemoveUmpireButton = styled.button`
    height: 2rem;
    padding: 0 0.65rem;
    border: none;
    border-radius: ${radius.pill};
    background: #fef2f2;
    color: #b91c1c;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: #fee2e2;
    }
`;

/* ─── Add Umpire Dialog ─── */

const StyledDialog = styled(Dialog)`
    .MuiPaper-root {
        border-radius: ${radius.xl};
    }
`;

const ModalContent = styled(DialogContent)`
    padding: ${spacing.lg} !important;
`;

const ModalHeaderRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
`;

const ModalTitle = styled(Typography)`
    font-size: 1.15rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const ModalSearchWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    height: 2.75rem;
    padding: 0 ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    background: ${colors.surfaceHover};
    margin-bottom: ${spacing.md};

    &:focus-within {
        border-color: ${colors.primary};
    }
`;

const ModalSearchInput = styled.input`
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

const CandidatesList = styled(Box)`
    max-height: 20rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const HintText = styled(Typography)`
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
    padding: ${spacing.lg} 0;
`;

const CandidateRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${radius.md};
    border: 1px solid ${colors.border};
    transition: border-color ${transition.fast};

    &:hover {
        border-color: ${colors.borderGreen};
        background: ${colors.surfaceHover};
    }
`;

const CandidateInfo = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;

const CandidateName = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const CandidateMeta = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
`;

const AddCandidateButton = styled.button`
    height: 2rem;
    padding: 0 0.75rem;
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    transition: all ${transition.fast};

    &:hover {
        background: ${colors.primaryHover};
    }
`;