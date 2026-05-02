import { History } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    NarrowPageWrapper,
    PageTitle,
    PageSubtitle,
    LoadingWrapper,
} from "../components/common/PageLayout";
import ScheduleLocationSection from "../components/schedule/ScheduleLocationSection";
import type { ScheduledMatch } from "../types/schedule";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../styles/theme";

type ScheduleGroup = Record<string, Record<string, Record<string, ScheduledMatch[]>>>;

function buildScheduleGroups(matches: ScheduledMatch[]): ScheduleGroup {
    return matches.reduce<ScheduleGroup>((acc, match) => {
        const date = match.matchDate;
        const loc = match.locationId != null ? String(match.locationId) : "__no_location__";
        const court = match.courtNumber != null ? String(match.courtNumber) : "__no_court__";

        if (!acc[date]) acc[date] = {};
        if (!acc[date][loc]) acc[date][loc] = {};
        if (!acc[date][loc][court]) acc[date][loc][court] = [];
        acc[date][loc][court].push(match);
        return acc;
    }, {} as ScheduleGroup);
}

function buildLocationNames(matches: ScheduledMatch[]): Record<string, string> {
    const map: Record<string, string> = {};
    matches.forEach((m) => {
        if (m.locationId != null && m.locationName) {
            map[String(m.locationId)] = m.locationName;
        }
    });
    return map;
}

function getTodayString(): string {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function SchedulePage() {
    const [matches, setMatches] = useState<ScheduledMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPast, setShowPast] = useState(false);
    const pastBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showPast && !loading && pastMatches.length > 0) {
            setTimeout(() => {
                pastBottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
        }
    }, [showPast, loading]);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await axiosInstance.get<ScheduledMatch[]>(
                    "/player/tournaments/schedule"
                );
                setMatches(response.data);
            } catch (error) {
                console.error("Failed to load schedule", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const today = getTodayString();

    const upcomingMatches = useMemo(
        () => matches.filter((m) => m.matchDate >= today),
        [matches, today]
    );

    const pastMatches = useMemo(
        () => matches.filter((m) => m.matchDate < today),
        [matches, today]
    );

    const displayedMatches = showPast ? pastMatches : upcomingMatches;

    const grouped = buildScheduleGroups(displayedMatches);
    const locationNames = buildLocationNames(displayedMatches);

    // Upcoming: ascending (soonest first). Past: ascending (oldest at top, scroll down to recent).
    const sortedDates = Object.keys(grouped).sort((a, b) =>
        showPast ? a.localeCompare(b) : a.localeCompare(b)
    );

    const hasPastMatches = pastMatches.length > 0;

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <HeaderRow>
                        <div>
                            <PageTitle>Schedule</PageTitle>
                            <PageSubtitle>
                                {showPast
                                    ? "Past scheduled matches."
                                    : "Upcoming scheduled matches."}
                            </PageSubtitle>
                        </div>
                        {hasPastMatches && (
                            <ToggleButton
                                $active={showPast}
                                onClick={() => setShowPast((prev) => !prev)}
                            >
                                <History sx={{ fontSize: 18 }} />
                                {showPast ? "Show upcoming" : "Show past"}
                            </ToggleButton>
                        )}
                    </HeaderRow>

                    {loading ? (
                        <LoadingWrapper>
                            <CircularProgress />
                        </LoadingWrapper>
                    ) : sortedDates.length === 0 ? (
                        <EmptyText>
                            {showPast
                                ? "No past matches found."
                                : "No upcoming matches scheduled."}
                        </EmptyText>
                    ) : (
                        <ScheduleList>
                            {sortedDates.map((date) => (
                                <DateBlock key={date}>
                                    <DateHeader>
                                        {new Date(date).toLocaleDateString("en-GB", {
                                            weekday: "long",
                                            day: "2-digit",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </DateHeader>

                                    {Object.entries(grouped[date]).map(([locId, courts]) => (
                                        <ScheduleLocationSection
                                            key={locId}
                                            locKey={locId}
                                            locationName={
                                                locId === "__no_location__"
                                                    ? "Unassigned"
                                                    : locationNames[locId] ?? `Location ${locId}`
                                            }
                                            courts={courts}
                                        />
                                    ))}
                                </DateBlock>
                            ))}
                            {showPast && <div ref={pastBottomRef} />}
                        </ScheduleList>
                    )}
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default SchedulePage;

const HeaderRow = styled(Box)`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${spacing.md};
    flex-wrap: wrap;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    height: 2.25rem;
    padding: 0 1rem;
    border: 1px solid ${({ $active }) => ($active ? colors.primary : colors.border)};
    border-radius: ${radius.pill};
    background: ${({ $active }) => ($active ? colors.primaryLighter : colors.surface)};
    color: ${({ $active }) => ($active ? colors.primary : colors.textSecondary)};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};
    white-space: nowrap;
    margin-top: 0.25rem;

    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryLight : colors.surfaceAlt)};
        border-color: ${({ $active }) => ($active ? colors.primaryHover : colors.textHint)};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const ScheduleList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl};
    margin-top: ${spacing.lg};
`;

const DateBlock = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

const DateHeader = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
    padding-bottom: ${spacing.xs};
    border-bottom: 2px solid ${colors.primaryLight};
`;

const EmptyText = styled(Typography)`
    color: ${colors.textHint};
    font-size: ${fontSize.base} !important;
    text-align: center;
    padding: ${spacing.xl} 0;
    margin-top: ${spacing.md};
`;