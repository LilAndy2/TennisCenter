import { useEffect, useState } from "react";
import {
    Box,
    CircularProgress,
    Typography,
} from "@mui/material";
import styled from "styled-components";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    CartesianGrid,
} from "recharts";

import type {
    ValueType,
    NameType,
    Payload,
} from "recharts/types/component/DefaultTooltipContent";

import axiosInstance from "../../api/axiosInstance";
import type { CareerStats } from "../../types/careerStats";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
} from "../../styles/theme";

type PlayerStatsSectionProps = {
    userId: number;
};

function PlayerStatsSection({ userId }: PlayerStatsSectionProps) {
    const [stats, setStats] = useState<CareerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");

        axiosInstance
            .get<CareerStats>(`/player/profile/${userId}/career-stats`)
            .then((res) => setStats(res.data))
            .catch(() => setError("Failed to load career stats"))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) {
        return (
            <CenterBox>
                <CircularProgress size={32} />
            </CenterBox>
        );
    }

    if (error) {
        return <ErrorText>{error}</ErrorText>;
    }

    if (!stats || stats.totalMatches === 0) {
        return (
            <EmptyState>
                <EmptyTitle>No stats yet</EmptyTitle>
                <EmptyText>
                    Play your first match to start building your performance
                    profile.
                </EmptyText>
            </EmptyState>
        );
    }

    // Prepare chart data (reverse so chronological)
    const trendData = [...stats.matchTrends].reverse().map((m, i) => ({
        idx: i + 1,
        label: m.date.slice(5),
        firstServePct: m.firstServePct,
        wToUe: m.winnersToUeRatio,
        winners: m.winners,
        ue: m.unforcedErrors,
        won: m.won,
        opponent: m.opponentName,
    }));

    const surfaceData = [
        {
            name: "Clay",
            winRate: stats.clayWinRate,
            matches: stats.clayMatches,
            color: "#c2410c",
        },
        {
            name: "Hard",
            winRate: stats.hardWinRate,
            matches: stats.hardMatches,
            color: "#1d4ed8",
        },
        {
            name: "Grass",
            winRate: stats.grassWinRate,
            matches: stats.grassMatches,
            color: "#15803d",
        },
    ].filter((s) => s.matches > 0);

    return (
        <Wrapper>
            {/* ── Overview Cards ── */}
            <SectionLabel>Overview</SectionLabel>

            <CardsGrid>
                <StatCard>
                    <CardLabel>Win Rate</CardLabel>
                    <CardValue>{stats.winRate}%</CardValue>
                    <CardSub>
                        {stats.wins}W – {stats.losses}L
                    </CardSub>
                </StatCard>

                <StatCard>
                    <CardLabel>Current Streak</CardLabel>

                    <CardValue $positive={stats.currentStreak > 0}>
                        {stats.currentStreak > 0
                            ? `${stats.currentStreak}W`
                            : stats.currentStreak < 0
                                ? `${Math.abs(stats.currentStreak)}L`
                                : "—"}
                    </CardValue>

                    <CardSub>
                        Best: {stats.longestWinStreak}W
                    </CardSub>
                </StatCard>

                <StatCard>
                    <CardLabel>Winners / UE</CardLabel>

                    <CardValue>{stats.winnersToUeRatio}</CardValue>

                    <CardSub>
                        {stats.winnersPerMatch} W –{" "}
                        {stats.unforcedErrorsPerMatch} UE / match
                    </CardSub>
                </StatCard>

                <StatCard>
                    <CardLabel>1st Serve %</CardLabel>

                    <CardValue>
                        {stats.firstServePercentage}%
                    </CardValue>

                    <CardSub>
                        {stats.acesPerMatch} aces / match
                    </CardSub>
                </StatCard>
            </CardsGrid>

            {/* ── Serve & Return ── */}
            <SectionLabel>Serve &amp; Return</SectionLabel>

            <StatsGrid>
                <StatItem
                    label="1st Serve %"
                    value={`${stats.firstServePercentage}%`}
                />

                <StatItem
                    label="1st Serve Pts Won"
                    value={`${stats.firstServePointsWonPct}%`}
                />

                <StatItem
                    label="2nd Serve Pts Won"
                    value={`${stats.secondServePointsWonPct}%`}
                />

                <StatItem
                    label="Aces / Match"
                    value={String(stats.acesPerMatch)}
                />

                <StatItem
                    label="Double Faults / Match"
                    value={String(stats.doubleFaultsPerMatch)}
                />

                <StatItem
                    label="Ace:DF Ratio"
                    value={String(stats.aceToDoubleFaultRatio)}
                />

                <StatItem
                    label="Service Games Held"
                    value={`${stats.serviceGamesHeldPct}%`}
                />

                <StatItem
                    label="Return Pts Won"
                    value={`${stats.returnPointsWonPct}%`}
                />

                <StatItem
                    label="Break Pts Converted"
                    value={`${stats.breakPointsConvertedPct}%`}
                />
            </StatsGrid>

            {/* ── Shotmaking ── */}
            <SectionLabel>Shotmaking</SectionLabel>

            <StatsGrid>
                <StatItem
                    label="Winners / Match"
                    value={String(stats.winnersPerMatch)}
                />

                <StatItem
                    label="FH Winners"
                    value={String(stats.fhWinnersPerMatch)}
                />

                <StatItem
                    label="BH Winners"
                    value={String(stats.bhWinnersPerMatch)}
                />

                <StatItem
                    label="Volley Winners"
                    value={String(stats.volleyWinnersPerMatch)}
                />

                <StatItem
                    label="UE / Match"
                    value={String(stats.unforcedErrorsPerMatch)}
                />

                <StatItem
                    label="FH UE"
                    value={String(stats.fhUnforcedErrorsPerMatch)}
                />

                <StatItem
                    label="BH UE"
                    value={String(stats.bhUnforcedErrorsPerMatch)}
                />

                <StatItem
                    label="Forced Err Drawn"
                    value={String(stats.forcedErrorsDrawnPerMatch)}
                />

                <StatItem
                    label="Net Success"
                    value={`${stats.netApproachSuccessPct}%`}
                />
            </StatsGrid>

            {/* ── Clutch ── */}
            <SectionLabel>Mental &amp; Clutch</SectionLabel>

            <CardsGrid $cols={3}>
                <StatCard>
                    <CardLabel>After Losing 1st Set</CardLabel>

                    <CardValue>
                        {stats.winRateAfterLosingFirstSet}%
                    </CardValue>

                    <CardSub>comeback win rate</CardSub>
                </StatCard>

                <StatCard>
                    <CardLabel>Deciding Sets</CardLabel>

                    <CardValue>
                        {stats.decidingSetWinRate}%
                    </CardValue>

                    <CardSub>3rd set win rate</CardSub>
                </StatCard>

                <StatCard>
                    <CardLabel>Tiebreaks</CardLabel>

                    <CardValue>{stats.tiebreakWinRate}%</CardValue>

                    <CardSub>tiebreak win rate</CardSub>
                </StatCard>
            </CardsGrid>

            {/* ── Surface Breakdown ── */}
            {surfaceData.length > 0 && (
                <>
                    <SectionLabel>Surface Breakdown</SectionLabel>

                    <ChartCard>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart
                                data={surfaceData}
                                barSize={48}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={colors.borderLight}
                                />

                                <XAxis
                                    dataKey="name"
                                    tick={{
                                        fontSize: 12,
                                        fill: colors.textSecondary,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tick={{
                                        fontSize: 12,
                                        fill: colors.textMuted,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />

                                <Tooltip
                                    formatter={(
                                        value: ValueType | undefined,
                                        _name: NameType | undefined,
                                        props: Payload<ValueType, NameType>
                                    ) => {
                                        const num = Number(value ?? 0);
                                        const matches = Number(props.payload?.matches ?? 0);

                                        return [
                                            `${num}% (${matches} matches)`,
                                            "Win Rate",
                                        ];
                                    }}
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: `1px solid ${colors.border}`,
                                        fontSize: 13,
                                    }}
                                />

                                <Bar
                                    dataKey="winRate"
                                    radius={[6, 6, 0, 0]}
                                >
                                    {surfaceData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.color}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </>
            )}

            {/* ── Trends ── */}
            {trendData.length >= 3 && (
                <>
                    <SectionLabel>
                        Performance Trends
                    </SectionLabel>

                    <ChartCard>
                        <ChartTitle>
                            1st Serve % Over Matches
                        </ChartTitle>

                        <ResponsiveContainer
                            width="100%"
                            height={220}
                        >
                            <LineChart data={trendData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={colors.borderLight}
                                />

                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11,
                                        fill: colors.textMuted,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tick={{
                                        fontSize: 11,
                                        fill: colors.textMuted,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v) => `${v}%`}
                                />

                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: `1px solid ${colors.border}`,
                                        fontSize: 13,
                                    }}
                                    formatter={(value: ValueType | undefined) => {
                                        const num = Number(value ?? 0);

                                        return [`${num}%`, "1st Serve %"];
                                    }}
                                    labelFormatter={(label) => `Match: ${label}`}
                                />

                                <Line
                                    type="monotone"
                                    dataKey="firstServePct"
                                    stroke={colors.primary}
                                    strokeWidth={2.5}
                                    dot={{
                                        r: 4,
                                        fill: colors.primary,
                                    }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard>
                        <ChartTitle>
                            Winners vs Unforced Errors
                        </ChartTitle>

                        <ResponsiveContainer
                            width="100%"
                            height={220}
                        >
                            <BarChart
                                data={trendData}
                                barGap={2}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke={colors.borderLight}
                                />

                                <XAxis
                                    dataKey="label"
                                    tick={{
                                        fontSize: 11,
                                        fill: colors.textMuted,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 11,
                                        fill: colors.textMuted,
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip
                                    contentStyle={{
                                        borderRadius: 8,
                                        border: `1px solid ${colors.border}`,
                                        fontSize: 13,
                                    }}
                                />

                                <Bar
                                    dataKey="winners"
                                    name="Winners"
                                    fill="#15803d"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />

                                <Bar
                                    dataKey="ue"
                                    name="UE"
                                    fill="#dc2626"
                                    radius={[4, 4, 0, 0]}
                                    barSize={16}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </>
            )}

            {/* ── Personalized Advice ── */}
            {stats.advice.length > 0 && (
                <>
                    <SectionLabel>
                        Personalized Insights
                    </SectionLabel>

                    <AdviceList>
                        {stats.advice.map((a, i) => (
                            <AdviceCard
                                key={i}
                                $severity={a.severity}
                            >
                                <AdviceIcon
                                    $severity={a.severity}
                                >
                                    {a.severity === "STRENGTH"
                                        ? "💪"
                                        : a.severity === "WARNING"
                                            ? "⚠️"
                                            : "ℹ️"}
                                </AdviceIcon>

                                <AdviceContent>
                                    <AdviceTitle>
                                        {a.title}
                                    </AdviceTitle>

                                    <AdviceMessage>
                                        {a.message}
                                    </AdviceMessage>
                                </AdviceContent>
                            </AdviceCard>
                        ))}
                    </AdviceList>
                </>
            )}
        </Wrapper>
    );
}

// ── Small stat item sub-component ──

function StatItem({
                      label,
                      value,
                  }: {
    label: string;
    value: string;
}) {
    return (
        <StatItemWrapper>
            <StatItemLabel>{label}</StatItemLabel>
            <StatItemValue>{value}</StatItemValue>
        </StatItemWrapper>
    );
}

export default PlayerStatsSection;

// ── Styled Components ──

const Wrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const CenterBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl};
`;

const ErrorText = styled(Typography)`
    text-align: center;
    color: ${colors.danger};
    padding: ${spacing.lg};
`;

const EmptyState = styled(Box)`
    text-align: center;
    padding: ${spacing.xl};
`;

const EmptyTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.xs} !important;
`;

const EmptyText = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
`;

const SectionLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 800 !important;
    color: ${colors.primary};
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-top: ${spacing.sm};
`;

const CardsGrid = styled(Box)<{ $cols?: number }>`
    display: grid;
    grid-template-columns: repeat(
        ${({ $cols }) => $cols ?? 4},
        1fr
    );

    gap: ${spacing.sm};

    @media (max-width: 48rem) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const StatCard = styled(Box)`
    padding: ${spacing.md};
    border-radius: ${radius.lg};
    background: ${colors.backgroundGreen};
    border: 1px solid ${colors.borderGreen};
    text-align: center;
`;

const CardLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: 700 !important;
    color: ${colors.textMuted};
    margin-bottom: 0.15rem !important;
`;

const CardValue = styled(Typography)<{
    $positive?: boolean;
}>`
    font-size: 1.5rem !important;
    font-weight: 900 !important;

    color: ${({ $positive }) =>
            $positive === true
                    ? "#15803d"
                    : $positive === false
                            ? "#b91c1c"
                            : colors.textPrimary};

    line-height: 1.2 !important;
`;

const CardSub = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    margin-top: 0.1rem !important;
`;

const StatsGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: ${colors.border};
    border: 1px solid ${colors.border};
    border-radius: ${radius.lg};
    overflow: hidden;

    @media (max-width: 36rem) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const StatItemWrapper = styled(Box)`
    padding: ${spacing.sm} ${spacing.md};
    background: ${colors.surface};
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
`;

const StatItemLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    font-weight: 600 !important;
`;

const StatItemValue = styled(Typography)`
    font-size: ${fontSize.md} !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
`;

const ChartCard = styled(Box)`
    padding: ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${radius.lg};
    background: ${colors.surface};
`;

const ChartTitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 700 !important;
    color: ${colors.textSecondary};
    margin-bottom: ${spacing.sm} !important;
`;

const AdviceList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const severityBg: Record<string, string> = {
    STRENGTH: "#f0fdf4",
    WARNING: "#fff7ed",
    INFO: "#f0f9ff",
};

const severityBorder: Record<string, string> = {
    STRENGTH: "#bbf7d0",
    WARNING: "#fed7aa",
    INFO: "#bae6fd",
};

const AdviceCard = styled(Box)<{
    $severity: string;
}>`
    display: flex;
    gap: ${spacing.sm};
    padding: ${spacing.md};
    border-radius: ${radius.lg};

    background: ${({ $severity }) =>
            severityBg[$severity] ?? severityBg.INFO};

    border: 1px solid
    ${({ $severity }) =>
            severityBorder[$severity] ??
            severityBorder.INFO};
`;

const AdviceIcon = styled(Box)<{
    $severity: string;
}>`
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
`;

const AdviceContent = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
`;

const AdviceTitle = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
`;

const AdviceMessage = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textSecondary};
    line-height: 1.5 !important;
`;