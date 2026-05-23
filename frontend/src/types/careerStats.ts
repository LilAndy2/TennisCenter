export type MatchStatSnapshot = {
    matchId: number;
    date: string;
    won: boolean;
    firstServePct: number;
    winnersToUeRatio: number;
    winners: number;
    unforcedErrors: number;
    aces: number;
    doubleFaults: number;
    surface: string | null;
    opponentName: string;
};

export type StatsAdvice = {
    category: string;
    severity: "INFO" | "WARNING" | "STRENGTH";
    title: string;
    message: string;
};

export type CareerStats = {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    titlesCount: number;
    finalsCount: number;
    currentStreak: number;
    longestWinStreak: number;
    avgPointsPerMatch: number;

    firstServePercentage: number;
    firstServePointsWonPct: number;
    secondServePointsWonPct: number;
    acesPerMatch: number;
    doubleFaultsPerMatch: number;
    aceToDoubleFaultRatio: number;
    serviceGamesHeldPct: number;

    returnPointsWonPct: number;
    breakPointsConvertedPct: number;

    winnersPerMatch: number;
    fhWinnersPerMatch: number;
    bhWinnersPerMatch: number;
    volleyWinnersPerMatch: number;
    unforcedErrorsPerMatch: number;
    fhUnforcedErrorsPerMatch: number;
    bhUnforcedErrorsPerMatch: number;
    winnersToUeRatio: number;
    forcedErrorsDrawnPerMatch: number;
    netApproachSuccessPct: number;

    winRateAfterLosingFirstSet: number;
    decidingSetWinRate: number;
    tiebreakWinRate: number;

    clayWinRate: number;
    hardWinRate: number;
    grassWinRate: number;
    clayMatches: number;
    hardMatches: number;
    grassMatches: number;

    matchTrends: MatchStatSnapshot[];
    advice: StatsAdvice[];
};