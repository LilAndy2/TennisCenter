import type { MatchSet } from "../types/match";

export function tiebreakSuperscriptForPlayerRow(set: MatchSet, forPlayerOne: boolean): number | null {
    if (set.playerOneTiebreakPoints == null || set.playerTwoTiebreakPoints == null) return null;
    if (set.playerOneGames === set.playerTwoGames) return null;
    const playerOneWonSet = set.playerOneGames > set.playerTwoGames;
    if (forPlayerOne && !playerOneWonSet) return set.playerOneTiebreakPoints;
    if (!forPlayerOne && playerOneWonSet) return set.playerTwoTiebreakPoints;
    return null;
}