export type PlayerProfile = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    playerLevel: string;
    rankingPoints: number;
    wins: number;
    losses: number;
    winRate: number;
    rank: number;
    profileImageUrl: string | null;
    bio: string | null;
    titlesCount: number;
    finalsCount: number;
};

export type MatchSetScore = {
    winnerGames: number;
    loserGames: number;
    loserTiebreakPoints: number | null;
};

export type MatchHistoryEntry = {
    matchId: number;
    matchDate: string;
    round: string;
    winnerName: string;
    winnerId: number;
    loserName: string;
    loserId: number;
    sets: MatchSetScore[];
    profilePlayerWon: boolean;
    tournamentId: number;
    tournamentName: string;
    surface: string | null;
    tournamentStartYear: number;
};