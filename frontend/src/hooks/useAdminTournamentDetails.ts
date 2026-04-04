import { useMemo, useState } from "react";
import type { TournamentFormData } from "../types/forms";
import useTournamentData from "./useTournamentData";
import useTournamentAdmin from "./useTournamentAdmin";
import useParticipantManagement from "./useParticipantManagement";
import useMatchScore from "./useMatchScore";
import useMatchSchedule from "./useMatchSchedule";

function useAdminTournamentDetails(id: string | undefined) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const dataHook = useTournamentData(id);

    const adminHook = useTournamentAdmin({
        id,
        setTournament: dataHook.setTournament,
        setMatches: dataHook.setMatches,
        loadGroupStandings: dataHook.loadGroupStandings,
        setIsEditModalOpen,
        setIsDeleteDialogOpen,
    });

    const participantHook = useParticipantManagement({
        id,
        loadParticipants: dataHook.loadParticipants,
        loadTournament: dataHook.loadTournament,
        loadGroupStandings: dataHook.loadGroupStandings,
    });

    const scoreHook = useMatchScore(dataHook.refreshMatchData);
    const scheduleHook = useMatchSchedule(dataHook.loadMatches);

    const initialEditData = useMemo<TournamentFormData | undefined>(() => {
        if (!dataHook.tournament) return undefined;
        return {
            name: dataHook.tournament.name,
            level: dataHook.tournament.level.toUpperCase(),
            bracketType:
                dataHook.tournament.bracketType === "Round Robin + Knockout"
                    ? "ROUND_ROBIN_THEN_KNOCKOUT"
                    : "SINGLE_ELIMINATION",
            surface: dataHook.tournament.surface.toUpperCase(),
            startDate: dataHook.tournament.startDate,
            endDate: dataHook.tournament.endDate,
            maxPlayers: String(dataHook.tournament.maxPlayers),
            locationIds: dataHook.tournament.locationIds ?? [],
            description: dataHook.tournament.description,
        };
    }, [dataHook.tournament]);

    return {
        tournament: dataHook.tournament,
        participants: dataHook.participants,
        matches: dataHook.matches,
        groupStandings: dataHook.groupStandings,
        loading: dataHook.loading,
        isEditModalOpen,
        isDeleteDialogOpen,
        setIsEditModalOpen,
        setIsDeleteDialogOpen,
        initialEditData,
        ...adminHook,
        ...participantHook,
        ...scoreHook,
        ...scheduleHook,
    };
}

export default useAdminTournamentDetails;