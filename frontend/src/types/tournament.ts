export type TournamentLevel =
    | "Entry"
    | "Starter"
    | "Medium"
    | "Master"
    | "Expert"
    | "Stellar";

export type TournamentStatus =
    | "Upcoming"
    | "Ongoing"
    | "Finished";

export type TournamentSurface =
    | "Clay"
    | "Hard"
    | "Grass";

export type TournamentType = {
    id: number;
    name: string;
    level: TournamentLevel;
    status: TournamentStatus;
    surface: TournamentSurface;
    startDate: string;
    endDate: string;
    maxPlayers: number;
    location: string;
    description: string;
    isFull: boolean;
    registeredByCurrentUser: boolean;
    registrationOpen: boolean;
    registrationAllowedByLevel: boolean;
    currentUserAdmin: boolean;
    currentPlayers: number;
    bracketType: string;
};

export type TournamentParticipantType = {
    id: number;
    fullName: string;
    email: string;
    registeredAt: string;
}