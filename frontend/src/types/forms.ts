export type TournamentFormData = {
    name: string;
    level: string;
    bracketType: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    locationIds: number[];
    description: string;
};

export type LocationFormData = {
    name: string;
    address: string;
    phone: string;
    email: string;
};