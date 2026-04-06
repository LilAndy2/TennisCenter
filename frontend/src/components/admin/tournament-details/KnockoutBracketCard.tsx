import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentMatch } from "../../../types/match";

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
    const knockoutMatches = matches.filter(m => m.phase === "KNOCKOUT");

    if (knockoutMatches.length === 0) return null;

    const visibleMatches = knockoutMatches.filter(
        m => !(m.playerTwoName === null && m.status === "COMPLETED")
    );

    const roundNumbers = [...new Set(visibleMatches.map(m => m.roundNumber ?? 1))].sort((a, b) => a - b);

    const matchesInFirstRound = visibleMatches.filter(m => m.roundNumber === roundNumbers[0]).length;
    const totalRounds = Math.max(1, Math.ceil(Math.log2(matchesInFirstRound * 2)));
    const maxRoundNumber = (roundNumbers[roundNumbers.length - 1] ?? 1) + totalRounds - 1;

    const byRound = roundNumbers.map(rn => ({
        roundNumber: rn,
        label: getRoundLabel(rn, maxRoundNumber),
        matches: visibleMatches
            .filter(m => m.roundNumber === rn)
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
                                    <MatchCard $completed={match.status === "COMPLETED"}>
                                        <PlayerRow $winner={match.winnerId === match.playerOneId && match.winnerId != null}>
                                            <PlayerName>{match.playerOneName ?? "TBD"}</PlayerName>
                                            {match.sets.length > 0 && (
                                                <ScoreChips>
                                                    {match.sets.map(s => (
                                                        <SetChip key={s.setNumber} $bold={s.playerOneGames > s.playerTwoGames}>
                                                            {s.playerOneGames}
                                                        </SetChip>
                                                    ))}
                                                </ScoreChips>
                                            )}
                                        </PlayerRow>
                                        <Divider />
                                        <PlayerRow $winner={match.winnerId === match.playerTwoId && match.winnerId != null}>
                                            <PlayerName>{match.playerTwoName ?? "TBD"}</PlayerName>
                                            {match.sets.length > 0 && (
                                                <ScoreChips>
                                                    {match.sets.map(s => (
                                                        <SetChip key={s.setNumber} $bold={s.playerTwoGames > s.playerOneGames}>
                                                            {s.playerTwoGames}
                                                        </SetChip>
                                                    ))}
                                                </ScoreChips>
                                            )}
                                        </PlayerRow>

                                        {!readOnly && match.status !== "COMPLETED" && (
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
                                </MatchWrapper>
                            ))}
                        </MatchesColumn>
                    </RoundColumn>
                ))}
            </BracketRow>
        </BracketScroller>
    );

    if (embedded) {
        return bracketContent;
    }

    return (
        <SectionCard>
            <SectionTitle>Knockout bracket</SectionTitle>
            {bracketContent}
        </SectionCard>
    );
}

export default KnockoutBracketCard;

const SectionCard = styled(Box)`
    grid-column: 1 / -1;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1.2rem;
    padding: 1.3rem;
    box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

const SectionTitle = styled(Typography)`
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 1rem !important;
`;

const BracketScroller = styled(Box)`
    overflow-x: auto;
    overflow-y: auto;
    max-height: 36rem;
    padding-bottom: 0.5rem;
    &::-webkit-scrollbar { height: 0.45rem; width: 0.4rem; }
    &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
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
    min-width: 14rem;
    max-width: 14rem;
    padding: 0 0.75rem;
    border-right: 1px dashed #e5e7eb;
    &:last-child { border-right: none; }
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

const MatchCard = styled(Box)<{ $completed: boolean }>`
    width: 100%;
    border: 1.5px solid ${({ $completed }) => ($completed ? "#d1fae5" : "#e5e7eb")};
    border-radius: 0.75rem;
    background: ${({ $completed }) => ($completed ? "#f0fdf4" : "white")};
    overflow: hidden;
    box-shadow: 0 0.2rem 0.6rem rgba(15, 23, 42, 0.04);
`;

const PlayerRow = styled(Box)<{ $winner: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.7rem;
    background: ${({ $winner }) => ($winner ? "#dcfce7" : "transparent")};
`;

const PlayerName = styled(Typography)`
    font-size: 0.85rem !important;
    font-weight: 600 !important;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 8rem;
`;

const ScoreChips = styled(Box)`
    display: flex;
    gap: 0.2rem;
    flex-shrink: 0;
`;

const SetChip = styled(Box)<{ $bold: boolean }>`
    font-size: 0.8rem;
    font-weight: ${({ $bold }) => ($bold ? "800" : "500")};
    color: ${({ $bold }) => ($bold ? "#111827" : "#64748b")};
    min-width: 1.1rem;
    text-align: center;
`;

const Divider = styled(Box)`
    height: 1px;
    background: #e5e7eb;
    margin: 0;
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
    &:hover { background: #059669; }
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
    &:hover { background: #dbeafe; }
`;

const ScheduleInfo = styled(Typography)`
    font-size: 0.72rem !important;
    color: #64748b;
    padding: 0 0.7rem 0.5rem !important;
`;