import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { PageWrapper, PageTitle, LoadingWrapper } from "../components/common/PageLayout";
import ScheduleLocationSection from "../components/schedule/ScheduleLocationSection";
import type { ScheduledMatch } from "../types/schedule";

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
            <PageWrapper>
                <PageTitle>Schedule</PageTitle>
                <PageSubtitle>All scheduled matches across ongoing tournaments.</PageSubtitle>

                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                ) : sortedDates.length === 0 ? (
                    <EmptyState>No matches have been scheduled yet.</EmptyState>
                ) : (
                    sortedDates.map((date) => {
                        const locationsOnDay = grouped[date];
                        const sortedLocations = Object.keys(locationsOnDay).sort();

                        return (
                            <DaySection key={date}>
                                <DateHeading>
                                    {new Date(date).toLocaleDateString("en-GB", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </DateHeading>

                                {sortedLocations.map((locKey) => (
                                    <ScheduleLocationSection
                                        key={locKey}
                                        locKey={locKey}
                                        locationName={locationNames[locKey] ?? "Unassigned"}
                                        courts={locationsOnDay[locKey]}
                                    />
                                ))}
                            </DaySection>
                        );
                    })
                )}
            </PageWrapper>
        </AuthenticatedLayout>
    );
}

export default SchedulePage;

const PageSubtitle = styled(Typography)`
  color: #64748b;
  margin-bottom: 2rem !important;
`;

const EmptyState = styled(Typography)`
  color: #94a3b8;
  font-size: 1rem !important;
  text-align: center;
  padding: 3rem 0;
`;

const DaySection = styled(Box)`
  margin-bottom: 2.5rem;
`;

const DateHeading = styled(Typography)`
  font-size: 1.25rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 1rem !important;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
`;