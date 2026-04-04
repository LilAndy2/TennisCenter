import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentParticipantType } from "../types/tournament";

type UseParticipantManagementParams = {
    id: string | undefined;
    loadParticipants: () => Promise<void>;
    loadTournament: () => Promise<void>;
    loadGroupStandings: () => Promise<void>;
};

function useParticipantManagement({
                                      id,
                                      loadParticipants,
                                      loadTournament,
                                      loadGroupStandings,
                                  }: UseParticipantManagementParams) {
    const [participantToRemove, setParticipantToRemove] =
        useState<TournamentParticipantType | null>(null);

    const handleOpenRemoveParticipantDialog = (participant: TournamentParticipantType) => {
        setParticipantToRemove(participant);
    };

    const handleCloseRemoveParticipantDialog = () => {
        setParticipantToRemove(null);
    };

    const handleConfirmRemoveParticipant = async () => {
        if (!participantToRemove) return;
        try {
            await axiosInstance.delete(
                `/admin/tournaments/${id}/participants/${participantToRemove.id}`
            );
            await Promise.all([loadParticipants(), loadTournament(), loadGroupStandings()]);
            setParticipantToRemove(null);
        } catch (error) {
            console.error("Failed to remove participant", error);
        }
    };

    return {
        participantToRemove,
        handleOpenRemoveParticipantDialog,
        handleCloseRemoveParticipantDialog,
        handleConfirmRemoveParticipant,
    };
}

export default useParticipantManagement;