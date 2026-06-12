import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
} from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";
import type { H2HResponse, PlayerSummary } from "../types/h2h";
import {
    colors,
    spacing,
    fontSize,
    radius,
    shadow,
    transition,
} from "../styles/theme";

function H2HPage() {
    const [playerA, setPlayerA] = useState<PlayerSummary | null>(null);
    const [playerB, setPlayerB] = useState<PlayerSummary | null>(null);
    const [h2hData, setH2hData] = useState<H2HResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Load H2H data when both players are selected
    useEffect(() => {
        if (!playerA || !playerB || playerA.id === playerB.id) {
            setH2hData(null);
            return;
        }

        setLoading(true);
        setError("");
        axiosInstance
            .get<H2HResponse>("/h2h", {
                params: { playerAId: playerA.id, playerBId: playerB.id },
            })
            .then((res) => setH2hData(res.data))
            .catch(() => setError("Failed to load H2H data"))
            .finally(() => setLoading(false));
    }, [playerA, playerB]);

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>Head to Head</PageTitle>
                        <PageSubtitle>
                            Compare two players, see their match history, and get an AI-powered
                            prediction for future encounters.
                        </PageSubtitle>
                    </PageHeader>

                    {/* ── Player Selection ── */}
                    <SelectionCard>
                        <PlayerSearchDropdown
                            label="Player A"
                            selected={playerA}
                            onSelect={setPlayerA}
                            excludeId={playerB?.id}
                        />
                        <VsDivider>VS</VsDivider>
                        <PlayerSearchDropdown
                            label="Player B"
                            selected={playerB}
                            onSelect={setPlayerB}
                            excludeId={playerA?.id}
                        />
                    </SelectionCard>

                    {playerA && playerB && playerA.id === playerB.id && (
                        <HintText>Please select two different players.</HintText>
                    )}

                    {loading && (
                        <CenterBox>
                            <CircularProgress size={32} />
                        </CenterBox>
                    )}

                    {error && <ErrorText>{error}</ErrorText>}

                    {h2hData && !loading && (
                        <>
                            {/* ── H2H Record ── */}
                            <SectionCard>
                                <H2HRecordBar data={h2hData} />
                            </SectionCard>

                            {/* ── AI Prediction ── */}
                            <SectionCard>
                                <SectionLabel>AI Match Prediction</SectionLabel>
                                <PredictionSection data={h2hData} />
                            </SectionCard>

                            {/* ── Upcoming Matches ── */}
                            {h2hData.upcomingMatches.length > 0 && (
                                <SectionCard>
                                    <SectionLabel>Upcoming Matches</SectionLabel>
                                    <MatchList>
                                        {h2hData.upcomingMatches.map((m) => (
                                            <MatchRow key={m.matchId}>
                                                <MatchTournament>{m.tournamentName}</MatchTournament>
                                                <MatchMeta>
                                                    {m.date}{m.surface ? ` · ${m.surface}` : ""}
                                                </MatchMeta>
                                                <ScheduledBadge>Scheduled</ScheduledBadge>
                                            </MatchRow>
                                        ))}
                                    </MatchList>
                                </SectionCard>
                            )}

                            {/* ── Past Matches ── */}
                            <SectionCard>
                                <SectionLabel>
                                    Match History
                                    {h2hData.totalMatches > 0 && (
                                        <MatchCount>{h2hData.totalMatches} match{h2hData.totalMatches !== 1 ? "es" : ""}</MatchCount>
                                    )}
                                </SectionLabel>
                                {h2hData.pastMatches.length === 0 ? (
                                    <EmptyText>These players haven't faced each other yet.</EmptyText>
                                ) : (
                                    <MatchList>
                                        {h2hData.pastMatches.map((m) => (
                                            <MatchRow key={m.matchId}>
                                                <MatchTournament>{m.tournamentName}</MatchTournament>
                                                <MatchMeta>
                                                    {m.date}{m.surface ? ` · ${m.surface}` : ""}
                                                </MatchMeta>
                                                <MatchScore>
                                                    <WinnerName $won={m.winnerId === h2hData.playerA.id}>
                                                        {m.winnerId === h2hData.playerA.id
                                                            ? h2hData.playerA.fullName
                                                            : h2hData.playerB.fullName}
                                                    </WinnerName>
                                                    <span>{m.score}</span>
                                                </MatchScore>
                                            </MatchRow>
                                        ))}
                                    </MatchList>
                                )}
                            </SectionCard>
                        </>
                    )}
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

function PlayerSearchDropdown({
                                  label,
                                  selected,
                                  onSelect,
                                  excludeId,
                              }: {
    label: string;
    selected: PlayerSummary | null;
    onSelect: (p: PlayerSummary | null) => void;
    excludeId?: number;
}) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<PlayerSummary[]>([]);
    const [open, setOpen] = useState(false);
    const [searching, setSearching] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    const search = useCallback(
        (q: string) => {
            if (q.length < 2) {
                setResults([]);
                return;
            }
            setSearching(true);
            axiosInstance
                .get<PlayerSummary[]>("/h2h/search-players", { params: { query: q } })
                .then((res) => {
                    const filtered = excludeId
                        ? res.data.filter((p) => p.id !== excludeId)
                        : res.data;
                    setResults(filtered);
                })
                .finally(() => setSearching(false));
        },
        [excludeId]
    );

    const handleInputChange = (value: string) => {
        setQuery(value);
        setOpen(true);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 300);
    };

    const handleSelect = (player: PlayerSummary) => {
        onSelect(player);
        setQuery(player.fullName);
        setOpen(false);
    };

    const handleClear = () => {
        onSelect(null);
        setQuery("");
        setResults([]);
    };
    
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    return (
        <DropdownWrapper ref={wrapperRef}>
            <DropdownLabel>{label}</DropdownLabel>
            <DropdownInputRow>
                <DropdownInput
                    placeholder="Search by name..."
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => { if (results.length > 0) setOpen(true); }}
                />
                {selected && <ClearButton onClick={handleClear}>✕</ClearButton>}
            </DropdownInputRow>

            {open && (results.length > 0 || searching) && (
                <DropdownList>
                    {searching ? (
                        <DropdownItem $disabled>Searching...</DropdownItem>
                    ) : (
                        results.map((p) => (
                            <DropdownItem key={p.id} onClick={() => handleSelect(p)}>
                                <span>{p.fullName}</span>
                                <DropdownMeta>{p.level} · Elo {p.eloRating}</DropdownMeta>
                            </DropdownItem>
                        ))
                    )}
                </DropdownList>
            )}
        </DropdownWrapper>
    );
}

function H2HRecordBar({ data }: { data: H2HResponse }) {
    const total = data.playerAWins + data.playerBWins;
    const pctA = total > 0 ? (data.playerAWins / total) * 100 : 50;
    const pctB = total > 0 ? (data.playerBWins / total) * 100 : 50;

    return (
        <RecordWrapper>
            <RecordPlayer>
                <RecordName>{data.playerA.fullName}</RecordName>
                <RecordSub>{data.playerA.level} · Elo {data.playerA.eloRating}</RecordSub>
                <RecordSub>{data.playerA.wins}W – {data.playerA.losses}L ({data.playerA.winRate}%)</RecordSub>
            </RecordPlayer>
            <RecordCenter>
                <RecordScore>{data.playerAWins} – {data.playerBWins}</RecordScore>
                <RecordLabel>H2H Record</RecordLabel>
                {total > 0 && (
                    <RecordBarOuter>
                        <RecordBarA style={{ width: `${pctA}%` }} />
                        <RecordBarB style={{ width: `${pctB}%` }} />
                    </RecordBarOuter>
                )}
            </RecordCenter>
            <RecordPlayer style={{ textAlign: "right" }}>
                <RecordName>{data.playerB.fullName}</RecordName>
                <RecordSub>{data.playerB.level} · Elo {data.playerB.eloRating}</RecordSub>
                <RecordSub>{data.playerB.wins}W – {data.playerB.losses}L ({data.playerB.winRate}%)</RecordSub>
            </RecordPlayer>
        </RecordWrapper>
    );
}

// ── Prediction Section ──

function PredictionSection({ data }: { data: H2HResponse }) {
    const { prediction, playerA, playerB } = data;

    return (
        <PredictionWrapper>
            {/* Probability bar */}
            <ProbBarWrapper>
                <ProbLabel $side="left">
                    <ProbName>{playerA.fullName}</ProbName>
                    <ProbValue>{prediction.playerAWinProbability}%</ProbValue>
                </ProbLabel>
                <ProbBarOuter>
                    <ProbBarA style={{ width: `${prediction.playerAWinProbability}%` }} />
                </ProbBarOuter>
                <ProbLabel $side="right">
                    <ProbName>{playerB.fullName}</ProbName>
                    <ProbValue>{prediction.playerBWinProbability}%</ProbValue>
                </ProbLabel>
            </ProbBarWrapper>

            <ConfidenceBadge $level={prediction.confidence}>
                {prediction.confidence} confidence
            </ConfidenceBadge>

            {/* Summary */}
            <PredictionSummary>{prediction.summary}</PredictionSummary>

            {/* Top features */}
            {prediction.topFeatures.length > 0 && (
                <>
                    <FeatureLabel>Key Factors</FeatureLabel>
                    <FeatureGrid>
                        {prediction.topFeatures.map((f) => (
                            <FeatureCard key={f.name} $positive={f.impact > 0}>
                                <FeatureDisplayName>{f.displayName}</FeatureDisplayName>
                                <FeatureValues>
                                    <FeatureVal $highlight={f.impact > 0}>{f.playerAValue}</FeatureVal>
                                    <FeatureVs>vs</FeatureVs>
                                    <FeatureVal $highlight={f.impact < 0}>{f.playerBValue}</FeatureVal>
                                </FeatureValues>
                                <FeatureImpactBar>
                                    <FeatureImpactFill
                                        $positive={f.impact > 0}
                                        style={{ width: `${Math.min(Math.abs(f.impact) * 5, 100)}%` }}
                                    />
                                </FeatureImpactBar>
                                <FeatureFavours>
                                    Favours {f.impact > 0 ? playerA.fullName : playerB.fullName}
                                </FeatureFavours>
                            </FeatureCard>
                        ))}
                    </FeatureGrid>
                </>
            )}
        </PredictionWrapper>
    );
}

export default H2HPage;

// ── Styled Components ──

const PageWrapper = styled(BasePageWrapper)`
    max-width: 60rem;
`;

const SelectionCard = styled(Box)`
    display: flex;
    align-items: flex-start;
    gap: ${spacing.md};
    padding: ${spacing.lg};
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    box-shadow: ${shadow.sm};
    margin-bottom: ${spacing.md};

    @media (max-width: 36rem) {
        flex-direction: column;
    }
`;

const VsDivider = styled(Typography)`
    font-size: 1.2rem !important;
    font-weight: 900 !important;
    color: ${colors.textMuted};
    padding-top: 1.8rem;
    flex-shrink: 0;

    @media (max-width: 36rem) {
        padding-top: 0;
        text-align: center;
    }
`;

const CenterBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const ErrorText = styled(Typography)`
    text-align: center;
    color: ${colors.danger};
    padding: ${spacing.md};
`;

const HintText = styled(Typography)`
    text-align: center;
    color: ${colors.textMuted};
    font-size: ${fontSize.sm} !important;
    padding: ${spacing.sm};
`;

const SectionLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 800 !important;
    color: ${colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: ${spacing.sm};
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
`;

const MatchCount = styled.span`
    font-weight: 600;
    color: ${colors.textMuted};
    text-transform: none;
    letter-spacing: 0;
`;

const EmptyText = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.sm} !important;
    text-align: center;
    padding: ${spacing.md};
`;

// ── Dropdown ──

const DropdownWrapper = styled.div`
    flex: 1;
    position: relative;
    min-width: 0;
`;

const DropdownLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 800 !important;
    color: ${colors.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: ${spacing.xs};
`;

const DropdownInputRow = styled(Box)`
    display: flex;
    align-items: center;
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    padding: 0 ${spacing.md};
    height: 2.75rem;
    transition: border-color ${transition.normal};

    &:focus-within {
        border-color: ${colors.primary};
    }
`;

const DropdownInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};
    &::placeholder { color: ${colors.textHint}; }
`;

const ClearButton = styled.button`
    border: none;
    background: none;
    color: ${colors.textMuted};
    cursor: pointer;
    font-size: 0.9rem;
    padding: 0.2rem;
    &:hover { color: ${colors.textPrimary}; }
`;

const DropdownList = styled(Box)`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 0.25rem;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.lg};
    box-shadow: ${shadow.md};
    max-height: 14rem;
    overflow-y: auto;
`;

const DropdownItem = styled.div<{ $disabled?: boolean }>`
    padding: ${spacing.sm} ${spacing.md};
    cursor: ${({ $disabled }) => ($disabled ? "default" : "pointer")};
    color: ${({ $disabled }) => ($disabled ? colors.textMuted : colors.textPrimary)};
    font-size: ${fontSize.sm};
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background ${transition.fast};

    &:hover {
        background: ${({ $disabled }) => ($disabled ? "transparent" : colors.surfaceHover)};
    }
`;

const DropdownMeta = styled.span`
    font-size: ${fontSize.xs};
    color: ${colors.textMuted};
`;

// ── H2H Record ──

const RecordWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.md};

    @media (max-width: 36rem) {
        flex-direction: column;
    }
`;

const RecordPlayer = styled(Box)`
    flex: 1;
    min-width: 0;
`;

const RecordName = styled(Typography)`
    font-size: ${fontSize.md} !important;
    font-weight: 900 !important;
    color: ${colors.textPrimary};
`;

const RecordSub = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
`;

const RecordCenter = styled(Box)`
    text-align: center;
    flex-shrink: 0;
    min-width: 10rem;
`;

const RecordScore = styled(Typography)`
    font-size: 2rem !important;
    font-weight: 900 !important;
    color: ${colors.textPrimary};
    line-height: 1 !important;
`;

const RecordLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    margin-bottom: ${spacing.xs} !important;
`;

const RecordBarOuter = styled(Box)`
    display: flex;
    height: 0.4rem;
    border-radius: 999px;
    overflow: hidden;
    gap: 2px;
`;

const RecordBarA = styled(Box)`
    background: ${colors.primary};
    border-radius: 999px 0 0 999px;
`;

const RecordBarB = styled(Box)`
    background: ${colors.textMuted};
    border-radius: 0 999px 999px 0;
`;

// ── Match list ──

const MatchList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: ${colors.borderLight};
    border: 1px solid ${colors.borderLight};
    border-radius: ${radius.lg};
    overflow: hidden;
`;

const MatchRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.md};
    padding: ${spacing.sm} ${spacing.md};
    background: ${colors.surface};

    @media (max-width: 36rem) {
        flex-direction: column;
        align-items: flex-start;
        gap: ${spacing.xs};
    }
`;

const MatchTournament = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 700 !important;
    color: ${colors.textPrimary};
    flex: 1;
`;

const MatchMeta = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    flex-shrink: 0;
`;

const MatchScore = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};
    font-size: ${fontSize.sm};
    font-weight: 700;
    color: ${colors.textSecondary};
    flex-shrink: 0;
`;

const WinnerName = styled.span<{ $won: boolean }>`
    font-weight: 800;
    color: ${({ $won }) => ($won ? colors.primary : colors.textSecondary)};
`;

const ScheduledBadge = styled.span`
    font-size: ${fontSize.xs};
    font-weight: 700;
    padding: 0.15rem 0.6rem;
    border-radius: ${radius.pill};
    background: #dbeafe;
    color: #1d4ed8;
    flex-shrink: 0;
`;

// ── Prediction ──

const PredictionWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const ProbBarWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.md};

    @media (max-width: 36rem) {
        flex-direction: column;
    }
`;

const ProbLabel = styled(Box)<{ $side: "left" | "right" }>`
    text-align: ${({ $side }) => $side};
    flex-shrink: 0;
    min-width: 7rem;
`;

const ProbName = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 700 !important;
    color: ${colors.textSecondary};
`;

const ProbValue = styled(Typography)`
    font-size: 1.5rem !important;
    font-weight: 900 !important;
    color: ${colors.textPrimary};
    line-height: 1.1 !important;
`;

const ProbBarOuter = styled(Box)`
    flex: 1;
    height: 1.5rem;
    background: ${colors.surfaceAlt};
    border-radius: 999px;
    overflow: hidden;
    min-width: 8rem;
`;

const ProbBarA = styled(Box)`
    height: 100%;
    background: linear-gradient(90deg, ${colors.primary}, ${colors.primaryHover});
    border-radius: 999px;
    transition: width 0.6s ease;
`;

const confidenceColors: Record<string, { bg: string; color: string }> = {
    HIGH: { bg: "#ecfdf5", color: "#047857" },
    MEDIUM: { bg: "#fff7ed", color: "#c2410c" },
    LOW: { bg: "#fef2f2", color: "#b91c1c" },
};

const ConfidenceBadge = styled.span<{ $level: string }>`
    align-self: center;
    font-size: ${fontSize.xs};
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding: 0.2rem 0.75rem;
    border-radius: ${radius.pill};
    background: ${({ $level }) => confidenceColors[$level]?.bg ?? "#f1f5f9"};
    color: ${({ $level }) => confidenceColors[$level]?.color ?? "#475569"};
`;

const PredictionSummary = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textSecondary};
    line-height: 1.6 !important;
    text-align: center;
    padding: 0 ${spacing.md};
`;

const FeatureLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 800 !important;
    color: ${colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
`;

const FeatureGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${spacing.sm};

    @media (max-width: 48rem) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const FeatureCard = styled(Box)<{ $positive: boolean }>`
    padding: ${spacing.sm};
    border-radius: ${radius.lg};
    background: ${colors.surface};
    border: 1px solid ${colors.borderLight};
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

const FeatureDisplayName = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 700 !important;
    color: ${colors.textSecondary};
`;

const FeatureValues = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
`;

const FeatureVal = styled.span<{ $highlight: boolean }>`
    font-size: ${fontSize.sm};
    font-weight: ${({ $highlight }) => ($highlight ? 900 : 600)};
    color: ${({ $highlight }) => ($highlight ? colors.primary : colors.textMuted)};
`;

const FeatureVs = styled.span`
    font-size: ${fontSize.xs};
    color: ${colors.textHint};
`;

const FeatureImpactBar = styled(Box)`
    height: 0.25rem;
    background: ${colors.surfaceAlt};
    border-radius: 999px;
    overflow: hidden;
`;

const FeatureImpactFill = styled(Box)<{ $positive: boolean }>`
    height: 100%;
    border-radius: 999px;
    background: ${({ $positive }) => ($positive ? colors.primary : "#6b7280")};
    transition: width 0.4s ease;
`;

const FeatureFavours = styled(Typography)`
    font-size: 0.65rem !important;
    color: ${colors.textMuted};
`;