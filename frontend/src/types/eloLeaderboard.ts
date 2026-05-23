export type EloLeaderboardEntry = {
    id: number;
    rank: number;
    fullName: string;
    level: string;
    eloRating: number;
    wins: number;
    losses: number;
    winRate: number;
};

export type EloLeaderboardResponse = {
    content: EloLeaderboardEntry[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
};