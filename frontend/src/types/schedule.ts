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