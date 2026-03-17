export type TournamentLevel =
    | "ENTRY"
    | "STARTER"
    | "MEDIUM"
    | "MASTER"
    | "EXPERT"
    | "STELAR";

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
    startDate: string;
    endDate: string;
    maxPlayers: number;
    currentPlayers: number;
    location: string;
    status: TournamentStatus;
    isFull: boolean;
    surface: TournamentSurface;
    description: string;
};

export const mockTournaments: TournamentType[] = [
    {
        id: 1,
        name: "Spring Local Open",
        level: "ENTRY",
        startDate: "2026-04-05",
        endDate: "2026-04-06",
        maxPlayers: 16,
        currentPlayers: 16,
        location: "Tennis Arena Bucharest",
        status: "Upcoming",
        isFull: true,
        surface: "Clay",
        description:
            "A beginner-friendly local tournament designed for players entering competitive tennis.",
    },
    {
        id: 2,
        name: "Starter Cup",
        level: "STARTER",
        startDate: "2026-03-10",
        endDate: "2026-03-16",
        maxPlayers: 16,
        currentPlayers: 16,
        location: "Urban Tennis Club",
        status: "Ongoing",
        isFull: true,
        surface: "Hard",
        description:
            "A competitive event for starter-level players looking to build match experience.",
    },
    {
        id: 3,
        name: "City Masters Challenge",
        level: "MASTER",
        startDate: "2026-03-14",
        endDate: "2026-03-18",
        maxPlayers: 32,
        currentPlayers: 18,
        location: "Central Sports Complex",
        status: "Ongoing",
        isFull: false,
        surface: "Hard",
        description:
            "A high-level local competition for advanced players with knockout brackets.",
    },
    {
        id: 4,
        name: "Elite Expert Series",
        level: "EXPERT",
        startDate: "2026-02-18",
        endDate: "2026-02-20",
        maxPlayers: 24,
        currentPlayers: 24,
        location: "National Tennis Center",
        status: "Finished",
        isFull: true,
        surface: "Clay",
        description:
            "An expert-level event bringing together the strongest local players.",
    },
    {
        id: 5,
        name: "Stelar Championship",
        level: "STELAR",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        maxPlayers: 16,
        currentPlayers: 6,
        location: "Royal Court Club",
        status: "Upcoming",
        isFull: false,
        surface: "Grass",
        description:
            "Top-tier local championship for the highest-performing players in the community.",
    },
];