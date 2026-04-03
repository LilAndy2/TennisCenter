export type MatchSet = {
    setNumber: number;
    playerOneGames: number;
    playerTwoGames: number;
    playerOneTiebreakPoints?: number | null;
    playerTwoTiebreakPoints?: number | null;
};

export type TournamentMatch = {
    id: number;
    tournamentId: number;
    phase: "GROUP_STAGE" | "KNOCKOUT";
    groupName?: string | null;
    roundNumber?: number | null;
    matchOrder?: number | null;
    status: "SCHEDULED" | "COMPLETED";
    matchDate?: string | null;
    playerOneId?: number | null;
    playerOneName?: string | null;
    playerTwoId?: number | null;
    playerTwoName?: string | null;
    winnerId?: number | null;
    winnerName?: string | null;
    sets: MatchSet[];
    editableByCurrentUser: boolean;
    scheduledTime?: string | null;
    courtId?: number | null;
    courtNumber?: number | null;
    locationName?: string | null;
};

export type GroupStandingPlayer = {
    playerId: number;
    position: number;
    playerName: string;
    wins: number;
    losses: number;
    setsWinPercentage: number;
    gamesWinPercentage: number;
};

export type GroupStanding = {
    groupName: string;
    players: GroupStandingPlayer[];
};

export type ScheduledMatch = {
    matchId: number;
    scheduledTime: string;
    matchDate: string;
    playerOneName: string;
    playerTwoName: string;
    tournamentName: string;
    tournamentLevel: string;
    courtId: number | null;
    courtNumber: number | null;
    locationId: number | null;
    locationName: string | null;
    status: string;
    winnerName: string | null;
};