import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import { tiebreakSuperscriptForPlayerRow } from "../../utils/tiebreakUtils";
import type { ScheduledMatch } from "../../types/schedule";

const levelColors: Record<string, { bg: string; border: string; text: string }> = {
    ENTRY:   { bg: "#ecfeff", border: "#a5f3fc", text: "#0e7490" },
    STARTER: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
    MEDIUM:  { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
    MASTER:  { bg: "#faf5ff", border: "#e9d5ff", text: "#7e22ce" },
    EXPERT:  { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
    STELLAR: { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
};

type ScheduleMatchChipProps = {
    match: ScheduledMatch;
};

function ScheduleMatchChip({ match }: ScheduleMatchChipProps) {
    const colors = levelColors[match.tournamentLevel] ?? levelColors.ENTRY;
    const sets = match.sets ?? [];
    const isPlayed = match.status === "COMPLETED" && Boolean(match.winnerName);
    const p1Won = isPlayed && match.winnerName === match.playerOneName;
    const p2Won = isPlayed && match.winnerName === match.playerTwoName;

    const time = new Date(match.scheduledTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <MatchChip $bg={colors.bg} $border={colors.border}>
            <MatchTime $color={colors.text}>{time}</MatchTime>

            <MatchPlayers>
                {isPlayed ? (
                    <>
                        <PlayerScoreRow>
                            <PlayerNameCell $bold={p1Won}>{match.playerOneName}</PlayerNameCell>
                            {sets.length > 0 && (
                                <SetScoresRow>
                                    {sets.map((set) => {
                                        const tb = tiebreakSuperscriptForPlayerRow(set, true);
                                        return (
                                            <SetGameColumn key={set.setNumber}>
                                                <SetGameNumber>
                                                    {set.playerOneGames}
                                                    {tb != null && <TiebreakSup>{tb}</TiebreakSup>}
                                                </SetGameNumber>
                                            </SetGameColumn>
                                        );
                                    })}
                                </SetScoresRow>
                            )}
                        </PlayerScoreRow>

                        <VsText>vs</VsText>

                        <PlayerScoreRow>
                            <PlayerNameCell $bold={p2Won}>{match.playerTwoName}</PlayerNameCell>
                            {sets.length > 0 && (
                                <SetScoresRow>
                                    {sets.map((set) => {
                                        const tb = tiebreakSuperscriptForPlayerRow(set, false);
                                        return (
                                            <SetGameColumn key={set.setNumber}>
                                                <SetGameNumber>
                                                    {set.playerTwoGames}
                                                    {tb != null && <TiebreakSup>{tb}</TiebreakSup>}
                                                </SetGameNumber>
                                            </SetGameColumn>
                                        );
                                    })}
                                </SetScoresRow>
                            )}
                        </PlayerScoreRow>
                    </>
                ) : (
                    <>
                        <PlayerNameCell $bold={false}>{match.playerOneName}</PlayerNameCell>
                        <VsText>vs</VsText>
                        <PlayerNameCell $bold={false}>{match.playerTwoName}</PlayerNameCell>
                    </>
                )}
            </MatchPlayers>

            <TournamentTag $color={colors.text}>{match.tournamentName}</TournamentTag>
        </MatchChip>
    );
}

export default ScheduleMatchChip;

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

const PlayerScoreRow = styled(Box)`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
`;

const PlayerNameCell = styled(Typography)<{ $bold: boolean }>`
  font-size: 0.88rem !important;
  font-weight: ${({ $bold }) => ($bold ? 700 : 400)} !important;
  color: #111827;
  flex: 1;
  min-width: 0;
`;

const SetScoresRow = styled(Box)`
  display: flex;
  flex-shrink: 0;
  gap: 0.4rem;
  align-items: baseline;
`;

const SetGameColumn = styled.span`
  display: inline-block;
  min-width: 1rem;
  text-align: center;
`;

const SetGameNumber = styled.span`
  font-size: 0.88rem !important;
  font-weight: 600 !important;
  color: #334155;
`;

const TiebreakSup = styled.sup`
  font-size: 0.65em;
  font-weight: 700;
  line-height: 0;
  color: #475569;
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