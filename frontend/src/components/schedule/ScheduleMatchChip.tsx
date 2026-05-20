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

            <MatchFooter>
                <TournamentLabel $color={colors.text}>{match.tournamentName}</TournamentLabel>
                {match.umpireName && (
                    <UmpireLabel>Umpire: {match.umpireName}</UmpireLabel>
                )}
            </MatchFooter>
        </MatchChip>
    );
}

export default ScheduleMatchChip;

const MatchChip = styled(Box)<{ $bg: string; $border: string }>`
    padding: 0.65rem 0.75rem;
    border-radius: 0.75rem;
    border: 1.5px solid ${({ $border }) => $border};
    background: ${({ $bg }) => $bg};
`;

const MatchTime = styled(Typography)<{ $color: string }>`
    font-size: 0.78rem !important;
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
    align-items: center;
    justify-content: space-between;
    gap: 0.4rem;
`;

const PlayerNameCell = styled(Typography)<{ $bold: boolean }>`
    font-size: 0.82rem !important;
    font-weight: ${({ $bold }) => ($bold ? 800 : 500)} !important;
    color: ${({ $bold }) => ($bold ? "#111827" : "#475569")};
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const VsText = styled(Typography)`
    font-size: 0.7rem !important;
    color: #94a3b8;
    font-weight: 700 !important;
`;

const SetScoresRow = styled(Box)`
    display: flex;
    gap: 0.3rem;
`;

const SetGameColumn = styled(Box)`
    min-width: 1rem;
    text-align: center;
`;

const SetGameNumber = styled(Typography)`
    font-size: 0.78rem !important;
    font-weight: 700 !important;
    color: #0f172a;
`;

const TiebreakSup = styled.sup`
    font-size: 0.55rem;
    font-weight: 700;
    vertical-align: super;
`;

const MatchFooter = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 0.35rem;
    gap: 0.35rem;
`;

const TournamentLabel = styled(Typography)<{ $color: string }>`
    font-size: 0.68rem !important;
    font-weight: 700 !important;
    color: ${({ $color }) => $color};
    opacity: 0.7;
`;

const UmpireLabel = styled(Typography)`
    font-size: 0.68rem !important;
    font-weight: 600 !important;
    color: #7e22ce;
`;