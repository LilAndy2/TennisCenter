import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentMatch } from "../../../types/match";
import BracketPlayerRow from "./BracketPlayerRow";

type BracketMatchCardProps = {
    match: TournamentMatch;
    readOnly: boolean;
    onUpdateScore?: (match: TournamentMatch) => void;
    onScheduleMatch?: (match: TournamentMatch) => void;
};

function BracketMatchCard({
                              match,
                              readOnly,
                              onUpdateScore,
                              onScheduleMatch,
                          }: BracketMatchCardProps) {
    const showActions =
        !readOnly &&
        match.status !== "COMPLETED" &&
        match.playerOneName != null &&
        match.playerTwoName != null;

    return (
        <MatchCard $completed={match.status === "COMPLETED"}>
            <BracketPlayerRow
                name={match.playerOneName}
                seed={match.playerOneSeed}
                sets={match.sets}
                isWinner={match.winnerId === match.playerOneId && match.winnerId != null}
                forPlayerOne
            />

            <Divider />

            <BracketPlayerRow
                name={match.playerTwoName}
                seed={match.playerTwoSeed}
                sets={match.sets}
                isWinner={match.winnerId === match.playerTwoId && match.winnerId != null}
                isBye={match.playerTwoName === null && match.roundNumber === 1}
                forPlayerOne={false}
            />

            {showActions && (
                <ActionRow>
                    {onUpdateScore && (
                        <ActionButton onClick={() => onUpdateScore(match)}>
                            Enter score
                        </ActionButton>
                    )}
                    {onScheduleMatch && (
                        <ScheduleActionButton onClick={() => onScheduleMatch(match)}>
                            {match.scheduledTime ? "Edit schedule" : "Set schedule"}
                        </ScheduleActionButton>
                    )}
                </ActionRow>
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

export default BracketMatchCard;

const MatchCard = styled(Box)<{ $completed: boolean }>`
  width: 100%;
  border: 1.5px solid ${({ $completed }) => ($completed ? "#d1fae5" : "#e5e7eb")};
  border-radius: 0.75rem;
  background: ${({ $completed }) => ($completed ? "#f0fdf4" : "white")};
  overflow: hidden;
  box-shadow: 0 0.2rem 0.6rem rgba(15, 23, 42, 0.04);
`;

const Divider = styled(Box)`
  height: 1px;
  background: #e5e7eb;
`;

const ActionRow = styled(Box)`
  display: flex;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  height: 1.9rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;

const ScheduleActionButton = styled.button`
  height: 1.9rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #dbeafe;
  }
`;

const ScheduleInfo = styled(Typography)`
  font-size: 0.72rem !important;
  color: #64748b;
  padding: 0 0.7rem 0.5rem !important;
`;