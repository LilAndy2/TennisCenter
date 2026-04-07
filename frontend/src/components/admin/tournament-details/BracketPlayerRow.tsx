import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { MatchSet } from "../../../types/match";
import { tiebreakSuperscriptForPlayerRow } from "../../../utils/tiebreakUtils";

type BracketPlayerRowProps = {
    name: string | null | undefined;
    seed: number | null | undefined;
    sets: MatchSet[];
    isWinner: boolean;
    isBye?: boolean;
    forPlayerOne: boolean;
};

function BracketPlayerRow({
                              name,
                              seed,
                              sets,
                              isWinner,
                              isBye = false,
                              forPlayerOne,
                          }: BracketPlayerRowProps) {
    return (
        <PlayerRow $winner={isWinner}>
            <PlayerInfo>
                <PlayerName $isBye={isBye}>{name ?? (isBye ? "BYE" : "TBD")}</PlayerName>
                {seed != null && <SeedBadge>({seed})</SeedBadge>}
            </PlayerInfo>

            {sets.length > 0 && (
                <ScoreChips>
                    {sets.map((s) => {
                        const tb = tiebreakSuperscriptForPlayerRow(s, forPlayerOne);
                        const games = forPlayerOne ? s.playerOneGames : s.playerTwoGames;
                        const opponentGames = forPlayerOne ? s.playerTwoGames : s.playerOneGames;
                        return (
                            <SetChipWrapper key={s.setNumber}>
                                <SetChip $bold={games > opponentGames}>{games}</SetChip>
                                {tb != null && <TiebreakSup>{tb}</TiebreakSup>}
                            </SetChipWrapper>
                        );
                    })}
                </ScoreChips>
            )}
        </PlayerRow>
    );
}

export default BracketPlayerRow;

const PlayerRow = styled(Box)<{ $winner: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 1rem;
  background: ${({ $winner }) => ($winner ? "#dcfce7" : "transparent")};
`;

const PlayerInfo = styled(Box)`
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
  overflow: hidden;
  min-width: 0;
`;

const PlayerName = styled(Typography)<{ $isBye?: boolean }>`
  font-size: 0.95rem !important;
  font-weight: ${({ $isBye }) => ($isBye ? "400" : "600")} !important;
  color: ${({ $isBye }) => ($isBye ? "#94a3b8" : "#111827")};
  font-style: ${({ $isBye }) => ($isBye ? "italic" : "normal")};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 10rem;
`;

const SeedBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  flex-shrink: 0;
  line-height: 1;
`;

const ScoreChips = styled(Box)`
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
  align-items: center;
`;

const SetChipWrapper = styled(Box)`
  display: inline-flex;
  align-items: center;
  position: relative;
  min-width: 1.4rem;
  justify-content: center;
`;

const SetChip = styled(Box)<{ $bold: boolean }>`
  font-size: 0.9rem;
  font-weight: ${({ $bold }) => ($bold ? "800" : "500")};
  color: ${({ $bold }) => ($bold ? "#111827" : "#64748b")};
  min-width: 1.1rem;
  text-align: center;
`;

const TiebreakSup = styled.sup`
  font-size: 0.55rem;
  font-weight: 700;
  color: #64748b;
  position: absolute;
  top: -0.15rem;
  right: -0.05rem;
`;