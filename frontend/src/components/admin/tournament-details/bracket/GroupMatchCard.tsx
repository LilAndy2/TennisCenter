import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentMatch } from "../../../../types/match.ts";
import SetScoreDisplay from "../../../common/SetScoreDisplay";

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
    onAssignUmpire?: (match: TournamentMatch) => void;
};

function GroupMatchCard({ match, readOnly, onUpdateScore, onScheduleMatch, onAssignUmpire }: GroupMatchCardProps) {
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
                    <SetScoreDisplay
                        sets={match.sets.map((s) => ({
                            winnerGames: s.playerOneGames,
                            loserGames: s.playerTwoGames,
                            loserTiebreakPoints: getTiebreakSuperscript(s),
                        }))}
                    />
                </InlineScoreRow>
            ) : (
                <NoScoreText>No score added yet.</NoScoreText>
            )}

            {match.umpireName && (
                <UmpireInfo>Umpire: {match.umpireName}</UmpireInfo>
            )}

            <ButtonsRow>
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

                {!readOnly && onAssignUmpire && match.playerOneId != null && match.playerTwoId != null && (
                    <UmpireButton onClick={() => onAssignUmpire(match)}>
                        {match.umpireName ? "Change umpire" : "Assign umpire"}
                    </UmpireButton>
                )}
            </ButtonsRow>

            {match.scheduledTime && (
                <ScheduleInfoText>
                    {new Date(match.scheduledTime).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                    {match.locationName ? ` · ${match.locationName}` : ""}
                    {match.courtNumber != null ? ` · Court ${match.courtNumber}` : ""}
                </ScheduleInfoText>
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

const NoScoreText = styled(Typography)`
    font-size: 0.8rem !important;
    color: #94a3b8;
    margin-bottom: 0.7rem !important;
`;

const UmpireInfo = styled(Typography)`
    font-size: 0.78rem !important;
    color: #475569;
    font-weight: 600 !important;
    margin-bottom: 0.5rem !important;
`;

const ButtonsRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-wrap: wrap;
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

  &:hover {
    background: #dbeafe;
  }
`;

const UmpireButton = styled.button`
  height: 2.3rem;
  padding: 0 0.85rem;
  border: none;
  border-radius: 999px;
  background: #faf5ff;
  color: #7e22ce;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #f3e8ff;
  }
`;

const ScheduleInfoText = styled(Typography)`
  font-size: 0.78rem !important;
  color: #64748b;
  margin-top: 0.35rem !important;
`;