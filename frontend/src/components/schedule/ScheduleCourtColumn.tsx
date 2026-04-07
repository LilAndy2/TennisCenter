import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { ScheduledMatch } from "../../types/schedule";
import ScheduleMatchChip from "./ScheduleMatchChip";

type ScheduleCourtColumnProps = {
    courtKey: string;
    matches: ScheduledMatch[];
};

function ScheduleCourtColumn({ courtKey, matches }: ScheduleCourtColumnProps) {
    const sorted = matches
        .slice()
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

    return (
        <CourtColumn>
            <CourtLabel>
                {courtKey !== "__no_court__" ? `Court ${courtKey}` : "Unassigned court"}
            </CourtLabel>
            <MatchesList>
                {sorted.map((match) => (
                    <ScheduleMatchChip key={match.matchId} match={match} />
                ))}
            </MatchesList>
        </CourtColumn>
    );
}

export default ScheduleCourtColumn;

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