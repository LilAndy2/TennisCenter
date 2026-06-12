export type PlayerSummary = {
    id: number;
    fullName: string;
    level: string;
    eloRating: number;
    wins: number;
    losses: number;
    winRate: number;
    rankingPoints: number;
};

export type H2HMatch = {
    matchId: number;
    tournamentName: string;
    surface: string | null;
    date: string;
    score: string | null;
    winnerId: number | null;
    status: "COMPLETED" | "SCHEDULED";
};

export type FeatureContribution = {
    name: string;
    displayName: string;
    playerAValue: number;
    playerBValue: number;
    impact: number;
};

export type Prediction = {
    playerAWinProbability: number;
    playerBWinProbability: number;
    topFeatures: FeatureContribution[];
    confidence: "HIGH" | "MEDIUM" | "LOW";
    summary: string;
};

export type H2HResponse = {
    playerA: PlayerSummary;
    playerB: PlayerSummary;
    playerAWins: number;
    playerBWins: number;
    totalMatches: number;
    pastMatches: H2HMatch[];
    upcomingMatches: H2HMatch[];
    prediction: Prediction;
};