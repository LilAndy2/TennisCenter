import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentMatch } from "../../../types/match";
import { SectionCard, SectionTitle } from "../../common/SectionCard";
import BracketMatchCard from "./BracketMatchCard";

type KnockoutBracketCardProps = {
    matches: TournamentMatch[];
    readOnly?: boolean;
    embedded?: boolean;
    onUpdateScore?: (match: TournamentMatch) => void;
    onScheduleMatch?: (match: TournamentMatch) => void;
};

function getRoundLabel(roundNumber: number, maxRoundNumber: number): string {
    const fromEnd = maxRoundNumber - roundNumber;
    if (fromEnd === 0) return "Final";
    if (fromEnd === 1) return "Semifinals";
    if (fromEnd === 2) return "Quarterfinals";
    return `Round of ${Math.pow(2, fromEnd + 1)}`;
}

function KnockoutBracketCard({
                                 matches,
                                 readOnly = false,
                                 embedded = false,
                                 onUpdateScore,
                                 onScheduleMatch,
                             }: KnockoutBracketCardProps) {
    const knockoutMatches = matches.filter((m) => m.phase === "KNOCKOUT");

    if (knockoutMatches.length === 0) return null;

    const roundNumbers = [
        ...new Set(knockoutMatches.map((m) => m.roundNumber ?? 1)),
    ].sort((a, b) => a - b);

    const maxRoundNumber = roundNumbers[roundNumbers.length - 1] ?? 1;

    const byRound = roundNumbers.map((rn) => ({
        roundNumber: rn,
        label: getRoundLabel(rn, maxRoundNumber),
        matches: knockoutMatches
            .filter((m) => m.roundNumber === rn)
            .sort((a, b) => (a.matchOrder ?? 0) - (b.matchOrder ?? 0)),
    }));

    const bracketContent = (
        <BracketScroller>
            <BracketRow>
                {byRound.map((round) => (
                    <RoundColumn key={round.roundNumber}>
                        <RoundLabel>{round.label}</RoundLabel>
                        <MatchesColumn $count={round.matches.length}>
                            {round.matches.map((match) => (
                                <MatchWrapper key={match.id}>
                                    <BracketMatchCard
                                        match={match}
                                        readOnly={readOnly}
                                        onUpdateScore={onUpdateScore}
                                        onScheduleMatch={onScheduleMatch}
                                    />
                                </MatchWrapper>
                            ))}
                        </MatchesColumn>
                    </RoundColumn>
                ))}
            </BracketRow>
        </BracketScroller>
    );

    if (embedded) return bracketContent;

    return (
        <SectionCard>
            <SectionTitle>Knockout bracket</SectionTitle>
            {bracketContent}
        </SectionCard>
    );
}

export default KnockoutBracketCard;

const BracketScroller = styled(Box)`
  overflow-x: auto;
  overflow-y: auto;
  max-height: 36rem;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 0.45rem;
    width: 0.4rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
`;

const BracketRow = styled(Box)`
  display: flex;
  gap: 0;
  align-items: stretch;
  min-width: max-content;
`;

const RoundColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  min-width: 18rem;
  max-width: 18rem;
  padding: 0 0.75rem;
  border-right: 1px dashed #e5e7eb;

  &:last-child {
    border-right: none;
  }
`;

const RoundLabel = styled(Typography)`
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem !important;
  text-align: center;
`;

const MatchesColumn = styled(Box)<{ $count: number }>`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
  gap: 0.75rem;
`;

const MatchWrapper = styled(Box)`
  display: flex;
  align-items: center;
`;