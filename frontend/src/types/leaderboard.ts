export type LeaderboardLevel =
    | "ENTRY"
    | "STARTER"
    | "MEDIUM"
    | "MASTER"
    | "EXPERT"
    | "STELLAR";

export type LeaderboardPlayer = {
    id: number;
    rank: number;
    fullName: string;
    level: string;
    wins: number;
    losses: number;
    winRate: number;
    points: number;
};

export type LeaderboardResponse = {
    content: LeaderboardPlayer[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
};