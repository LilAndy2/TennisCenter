import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import type { ScheduledMatch } from "../types/schedule";

const levelColors: Record<string, { bg: string; border: string; text: string }> = {
    ENTRY:   { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" },
    STARTER: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
    MEDIUM:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    MASTER:  { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
    EXPERT:  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
    STELLAR: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
};

function SchedulePage() {
    const [matches, setMatches] = useState<ScheduledMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await axiosInstance.get<ScheduledMatch[]>("/player/tournaments/schedule");
                setMatches(response.data);
            } catch (error) {
                console.error("Failed to load schedule", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    type ScheduleGroup = Record<string, Record<string, Record<string, ScheduledMatch[]>>>;

    const grouped = matches.reduce<ScheduleGroup>((acc, match) => {
        const date = match.matchDate;
        const loc = match.locationId != null
            ? String(match.locationId)
            : "__no_location__";
        const court = match.courtNumber != null
            ? String(match.courtNumber)
            : "__no_court__";

        if (!acc[date]) acc[date] = {};
        if (!acc[date][loc]) acc[date][loc] = {};
        if (!acc[date][loc][court]) acc[date][loc][court] = [];
        acc[date][loc][court].push(match);
        return acc;
    }, {} as ScheduleGroup);

    const sortedDates = Object.keys(grouped).sort();

    const locationNames: Record<string, string> = {};
    matches.forEach(m => {
        if (m.locationId != null && m.locationName) {
            locationNames[String(m.locationId)] = m.locationName;
        }
    });

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <PageTitle>Schedule</PageTitle>
                <PageSubtitle>
                    All scheduled matches across ongoing tournaments.
                </PageSubtitle>

                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                ) : sortedDates.length === 0 ? (
                    <EmptyState>No matches have been scheduled yet.</EmptyState>
                ) : (
                    sortedDates.map(date => {
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

                                {sortedLocations.map(locKey => {
                                    const courts = locationsOnDay[locKey];
                                    const sortedCourts = Object.keys(courts).sort((a, b) =>
                                        Number(a) - Number(b)
                                    );
                                    const locName = locationNames[locKey] ?? "Unassigned";

                                    return (
                                        <LocationSection key={locKey}>
                                            <LocationHeading>{locName}</LocationHeading>

                                            <CourtsRow>
                                                {sortedCourts.map(courtKey => (
                                                    <CourtColumn key={courtKey}>
                                                        <CourtLabel>
                                                            {courtKey !== "__no_court__"
                                                                ? `Court ${courtKey}`
                                                                : "Unassigned court"}
                                                        </CourtLabel>

                                                        <MatchesList>
                                                            {courts[courtKey]
                                                                .slice()
                                                                .sort((a, b) =>
                                                                    a.scheduledTime.localeCompare(b.scheduledTime)
                                                                )
                                                                .map(match => {
                                                                    const colors = levelColors[match.tournamentLevel]
                                                                        ?? levelColors.ENTRY;
                                                                    const time = new Date(match.scheduledTime)
                                                                        .toLocaleTimeString("en-GB", {
                                                                            hour: "2-digit",
                                                                            minute: "2-digit",
                                                                        });

                                                                    return (
                                                                        <MatchChip
                                                                            key={match.matchId}
                                                                            $bg={colors.bg}
                                                                            $border={colors.border}
                                                                        >
                                                                            <MatchTime $color={colors.text}>
                                                                                {time}
                                                                            </MatchTime>
                                                                            <MatchPlayers>
                                                                                <PlayerLine>{match.playerOneName}</PlayerLine>
                                                                                <VsText>vs</VsText>
                                                                                <PlayerLine>{match.playerTwoName}</PlayerLine>
                                                                            </MatchPlayers>
                                                                            <TournamentTag $color={colors.text}>
                                                                                {match.tournamentName}
                                                                            </TournamentTag>
                                                                            {match.status === "COMPLETED" && match.winnerName ? (
                                                                                <WinnerTag>
                                                                                    ✓ {match.winnerName}
                                                                                </WinnerTag>
                                                                            ) : null}
                                                                        </MatchChip>
                                                                    );
                                                                })}
                                                        </MatchesList>
                                                    </CourtColumn>
                                                ))}
                                            </CourtsRow>
                                        </LocationSection>
                                    );
                                })}
                            </DaySection>
                        );
                    })
                )}
            </PageWrapper>
        </AuthenticatedLayout>
    );
}

export default SchedulePage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 90rem;
  margin: 0 auto;
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.3rem !important;
`;

const PageSubtitle = styled(Typography)`
  color: #64748b;
  margin-bottom: 2rem !important;
`;

const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 3rem 0;
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

const LocationSection = styled(Box)`
  margin-bottom: 1.5rem;
`;

const LocationHeading = styled(Typography)`
  font-size: 1rem !important;
  font-weight: 700 !important;
  color: #475569;
  margin-bottom: 0.75rem !important;
`;

const CourtsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.4rem;
  align-items: flex-start;

  &::-webkit-scrollbar {
    height: 0.4rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
`;

const CourtColumn = styled(Box)`
  flex: 0 0 14rem;
  min-width: 14rem;
`;

const CourtLabel = styled(Typography)`
  font-size: 0.82rem !important;
  font-weight: 800 !important;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.5rem !important;
`;

const MatchesList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const MatchChip = styled(Box)<{ $bg: string; $border: string }>`
  background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $border }) => $border};
  border-radius: 0.85rem;
  padding: 0.75rem 0.85rem;
`;

const MatchTime = styled(Typography)<{ $color: string }>`
  font-size: 0.82rem !important;
  font-weight: 800 !important;
  color: ${({ $color }) => $color};
  margin-bottom: 0.3rem !important;
`;

const MatchPlayers = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`;

const PlayerLine = styled(Typography)`
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const VsText = styled(Typography)`
  font-size: 0.75rem !important;
  color: #94a3b8;
  font-weight: 600 !important;
`;

const TournamentTag = styled(Typography)<{ $color: string }>`
  font-size: 0.75rem !important;
  color: ${({ $color }) => $color};
  font-weight: 600 !important;
  margin-top: 0.4rem !important;
  opacity: 0.85;
`;

const WinnerTag = styled(Typography)`
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #059669;
  margin-top: 0.25rem !important;
`;