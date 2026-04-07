import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { GroupStanding, TournamentMatch } from "../../../types/match";
import GroupStandingsTable from "./GroupStandingsTable";
import GroupMatchCard from "./GroupMatchCard";

type GroupColumnProps = {
    standing: GroupStanding;
    matches: TournamentMatch[];
    maxPlayersInGroup: number;
    readOnly: boolean;
    onUpdateScore?: (match: TournamentMatch) => void;
    onScheduleMatch?: (match: TournamentMatch) => void;
};

function GroupColumn({
                         standing,
                         matches,
                         maxPlayersInGroup,
                         readOnly,
                         onUpdateScore,
                         onScheduleMatch,
                     }: GroupColumnProps) {
    const groupMatches = matches.filter(
        (m) => m.phase === "GROUP_STAGE" && m.groupName === standing.groupName
    );

    return (
        <ColumnWrapper>
            <GroupTitle>{standing.groupName}</GroupTitle>

            <GroupStandingsTable
                standing={standing}
                maxPlayersInGroup={maxPlayersInGroup}
            />

            <MatchesSectionTitle>Matches</MatchesSectionTitle>

            {groupMatches.length === 0 ? (
                <EmptyMatchesText>No matches generated for this group.</EmptyMatchesText>
            ) : (
                <MatchesList>
                    {groupMatches.map((match) => (
                        <GroupMatchCard
                            key={match.id}
                            match={match}
                            readOnly={readOnly}
                            onUpdateScore={onUpdateScore}
                            onScheduleMatch={onScheduleMatch}
                        />
                    ))}
                </MatchesList>
            )}
        </ColumnWrapper>
    );
}

export default GroupColumn;

const ColumnWrapper = styled(Box)`
  min-width: 28rem;
  max-width: 28rem;
  flex: 0 0 28rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: #f8fafc;
  padding: 1rem;
`;

const GroupTitle = styled(Typography)`
  font-size: 1rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.65rem !important;
`;

const MatchesSectionTitle = styled(Typography)`
  font-size: 0.95rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.6rem !important;
`;

const EmptyMatchesText = styled(Typography)`
  color: #64748b;
  font-size: 0.88rem !important;
`;

const MatchesList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;