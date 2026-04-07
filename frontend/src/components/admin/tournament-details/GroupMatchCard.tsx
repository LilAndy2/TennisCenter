import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentMatch } from "../../../types/match";

const getTiebreakSuperscript = (matchSet: TournamentMatch["sets"][number]) => {
    if (matchSet.playerOneTiebreakPoints == null || matchSet.playerTwoTiebreakPoints == null) return null;
    if (matchSet.playerOneGames === matchSet.playerTwoGames) return null;
    const playerOneWonSet = matchSet.playerOneGames > matchSet.playerTwoGames;
    return playerOneWonSet ? matchSet.playerTwoTiebreakPoints : matchSet.playerOneTiebreakPoints;
};

type GroupMatchCardProps = {
    match: TournamentMatch;
    readOnly: boolean;
    onUpdateScore?: (match: TournamentMatch) => void;
    onScheduleMatch?: (match: TournamentMatch) => void;
};

function GroupMatchCard({ match, readOnly, onUpdateScore, onScheduleMatch }: GroupMatchCardProps) {
    return (
        <MatchCard>
            <MatchPlayersRow>
                <PlayerName>{match.playerOneName ?? "TBD"}</PlayerName>
                <VersusText>vs</VersusText>
                <PlayerName>{match.playerTwoName ?? "TBD"}</PlayerName>
            </MatchPlayersRow>

            <MatchMetaRow>
                <MatchStatusBadge $completed={match.status === "COMPLETED"}>
                    {match.status}
                </MatchStatusBadge>
                {match.winnerName && <WinnerText>Winner: {match.winnerName}</WinnerText>}
            </MatchMetaRow>

            {match.sets.length > 0 ? (
                <InlineScoreRow>
                    {match.sets.map((set, index) => {
                        const tb = getTiebreakSuperscript(set);
                        return (
                            <SetInlineChunk key={set.setNumber}>
                                <SetInlineScore>
                                    {set.playerOneGames}-{set.playerTwoGames}
                                    {tb != null && <SetTiebreakSuperscript>{tb}</SetTiebreakSuperscript>}
                                </SetInlineScore>
                                {index < match.sets.length - 1 && <SetSeparator>/</SetSeparator>}
                            </SetInlineChunk>
                        );
                    })}
                </InlineScoreRow>
            ) : (
                <NoScoreText>No score added yet.</NoScoreText>
            )}

            {!readOnly && onUpdateScore && (
                <UpdateScoreButton onClick={() => onUpdateScore(match)}>
                    Update score
                </UpdateScoreButton>
            )}

            {!readOnly &&
                onScheduleMatch &&
                match.status !== "COMPLETED" &&
                match.playerOneId != null &&
                match.playerTwoId != null && (
                    <ScheduleButton onClick={() => onScheduleMatch(match)}>
                        {match.scheduledTime ? "Edit schedule" : "Set schedule"}
                    </ScheduleButton>
                )}

            {match.scheduledTime && (
                <ScheduleInfo>
                    {new Date(match.scheduledTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {match.locationName ? ` · ${match.locationName}` : ""}
                    {match.courtNumber != null ? ` · Court ${match.courtNumber}` : ""}
                </ScheduleInfo>
            )}
        </MatchCard>
    );
}

export default GroupMatchCard;

const MatchCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 0.95rem;
  box-shadow: 0 0.35rem 1rem rgba(15, 23, 42, 0.04);
`;

const MatchPlayersRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-wrap: wrap;
  margin-bottom: 0.45rem;
`;

const PlayerName = styled(Typography)`
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const VersusText = styled(Typography)`
  font-size: 0.82rem !important;
  color: #64748b;
  font-weight: 700 !important;
`;

const MatchMetaRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
`;

const MatchStatusBadge = styled(Typography)<{ $completed: boolean }>`
  width: fit-content;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  background: ${({ $completed }) => ($completed ? "#dcfce7" : "#eff6ff")};
  color: ${({ $completed }) => ($completed ? "#15803d" : "#1d4ed8")};
`;

const WinnerText = styled(Typography)`
  font-size: 0.8rem !important;
  color: #475569;
  font-weight: 600 !important;
`;

const InlineScoreRow = styled(Box)`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  column-gap: 0.35rem;
  margin-bottom: 0.7rem;
  padding: 0.35rem 0.55rem;
  border-radius: 0.7rem;
  background: #f8fafc;
`;

const SetInlineChunk = styled(Box)`
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
`;

const SetInlineScore = styled(Typography)`
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  color: #0f172a;
`;

const SetSeparator = styled(Typography)`
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  color: #64748b;
`;

const SetTiebreakSuperscript = styled.sup`
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1;
  vertical-align: super;
`;

const NoScoreText = styled(Typography)`
  font-size: 0.8rem !important;
  color: #94a3b8;
  margin-bottom: 0.7rem !important;
`;

const UpdateScoreButton = styled.button`
  height: 2.3rem;
  padding: 0 0.85rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;

const ScheduleButton = styled.button`
  height: 2.3rem;
  padding: 0 0.85rem;
  border: none;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.4rem;

  &:hover {
    background: #dbeafe;
  }
`;

const ScheduleInfo = styled(Typography)`
  font-size: 0.78rem !important;
  color: #64748b;
  margin-top: 0.35rem !important;
`;