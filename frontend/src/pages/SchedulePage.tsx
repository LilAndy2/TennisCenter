import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import {
    NarrowPageWrapper,
    PageTitle,
    PageSubtitle,
    LoadingWrapper,
} from "../components/common/PageLayout";
import ScheduleLocationSection from "../components/schedule/ScheduleLocationSection";
import type { ScheduledMatch } from "../types/schedule";
import { colors, spacing, fontSize } from "../styles/theme";

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

function SchedulePage() {
    const [matches, setMatches] = useState<ScheduledMatch[]>([]);
    const [loading, setLoading] = useState(true);

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

    const grouped = buildScheduleGroups(matches);
    const locationNames = buildLocationNames(matches);
    const sortedDates = Object.keys(grouped).sort();

    return (
        <AuthenticatedLayout>
            <NarrowPageWrapper>
                <PageTitle>Schedule</PageTitle>
                <PageSubtitle>All scheduled matches across ongoing tournaments.</PageSubtitle>

                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                ) : sortedDates.length === 0 ? (
                    <EmptyText>No scheduled matches found.</EmptyText>
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
                    </ScheduleList>
                )}
            </NarrowPageWrapper>
        </AuthenticatedLayout>
    );
}

export default SchedulePage;

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