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
};