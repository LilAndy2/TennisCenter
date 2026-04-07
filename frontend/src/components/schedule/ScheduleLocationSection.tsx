import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { ScheduledMatch } from "../../types/schedule";
import ScheduleCourtColumn from "./ScheduleCourtColumn";

type ScheduleLocationSectionProps = {
    locKey: string;
    locationName: string;
    courts: Record<string, ScheduledMatch[]>;
};

function ScheduleLocationSection({
                                     locationName,
                                     courts,
                                 }: ScheduleLocationSectionProps) {
    const sortedCourts = Object.keys(courts).sort((a, b) => Number(a) - Number(b));

    return (
        <LocationSection>
            <LocationHeading>{locationName}</LocationHeading>
            <CourtsRow>
                {sortedCourts.map((courtKey) => (
                    <ScheduleCourtColumn
                        key={courtKey}
                        courtKey={courtKey}
                        matches={courts[courtKey]}
                    />
                ))}
            </CourtsRow>
        </LocationSection>
    );
}

export default ScheduleLocationSection;

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