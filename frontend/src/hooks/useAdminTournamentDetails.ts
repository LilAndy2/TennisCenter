import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentParticipantType, TournamentType } from "../types/tournament";
import type { TournamentMatch, GroupStanding } from "../types/match.ts";

export type TournamentFormData = {
    name: string;
    level: string;
    bracketType: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    location: string;
    description: string;
};

function useAdminTournamentDetails(id: string | undefined) {
    const [tournament, setTournament] = useState<TournamentType | null>(null);
    const [participants, setParticipants] = useState<TournamentParticipantType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [participantToRemove, setParticipantToRemove] =
        useState<TournamentParticipantType | null>(null);
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [groupStandings, setGroupStandings] = useState<GroupStanding[]>([]);

    const loadTournament = async () => {
        try {
            const response = await axiosInstance.get<TournamentType>(
                `/player/tournaments/${id}`
            );
            setTournament(response.data);
        } catch (error) {
            console.error("Failed to load admin tournament details", error);
            setTournament(null);
        } finally {
            setLoading(false);
        }
    };

    const loadParticipants = async () => {
        try {
            const response = await axiosInstance.get<TournamentParticipantType[]>(
                `/player/tournaments/${id}/participants`
            );
            setParticipants(response.data);
        } catch (error) {
            console.error("Failed to load participants", error);
        }
    };

    const loadMatches = async () => {
        try {
            const response = await axiosInstance.get<TournamentMatch[]>(
                `/player/tournaments/${id}/matches`
            );
            setMatches(response.data);
        } catch (error) {
            console.error("Failed to load matches", error);
        }
    }

    const loadGroupStandings = async () => {
        try {
            const response = await axiosInstance.get<GroupStanding[]>(
                `/player/tournaments/${id}/group-standings`
            );
            setGroupStandings(response.data);
        } catch (error) {
            console.error("Failed to load group standings", error);
        }
    };

    useEffect(() => {
        if (!id) return;
        loadTournament();
        loadParticipants();
        loadMatches();
        loadGroupStandings();
    }, [id]);

    const initialEditData = useMemo<TournamentFormData | undefined>(() => {
        if (!tournament) return undefined;

        return {
            name: tournament.name,
            level: tournament.level.toUpperCase(),
            bracketType:
                tournament.bracketType === "Round Robin + Knockout"
                    ? "ROUND_ROBIN_THEN_KNOCKOUT"
                    : "SINGLE_ELIMINATION",
            surface: tournament.surface.toUpperCase(),
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            maxPlayers: String(tournament.maxPlayers),
            location: tournament.location,
            description: tournament.description,
        };
    }, [tournament]);

    const handleEditTournament = async (data: TournamentFormData) => {
        try {
            const response = await axiosInstance.put<TournamentType>(
                `/admin/tournaments/${id}`,
                {
                    name: data.name,
                    level: data.level,
                    bracketType: data.bracketType,
                    surface: data.surface,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    maxPlayers: Number(data.maxPlayers),
                    location: data.location,
                    description: data.description,
                }
            );

            setTournament(response.data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update tournament", error);
            throw error;
        }
    };

    const handleDeleteTournament = async (onSuccess: () => void) => {
        try {
            await axiosInstance.delete(`/admin/tournaments/${id}`);
            setIsDeleteDialogOpen(false);
            onSuccess();
        } catch (error) {
            console.error("Failed to delete tournament", error);
        }
    };

    const handleOpenRemoveParticipantDialog = (
        participant: TournamentParticipantType
    ) => {
        setParticipantToRemove(participant);
    };

    const handleConfirmRemoveParticipant = async () => {
        if (!participantToRemove) return;

        try {
            await axiosInstance.delete(
                `/admin/tournaments/${id}/participants/${participantToRemove.id}`
            );

            await loadParticipants();
            await loadTournament();
            await loadGroupStandings();
            setParticipantToRemove(null);
        } catch (error) {
            console.error("Failed to remove participant", error);
        }
    };

    const handleCloseRemoveParticipantDialog = () => {
        setParticipantToRemove(null);
    };

    const handleStartTournament = async () => {
        try {
            const response = await axiosInstance.post<TournamentType>(
                `/admin/tournaments/${id}/start`
            );
            setTournament(response.data);
        } catch (error) {
            console.error("Failed to start tournament", error);
        }
    }

    const handleFinishTournament = async () => {
        try {
            const response = await axiosInstance.post<TournamentType>(
                `/admin/tournaments/${id}/finish`
            );
            setTournament(response.data);
        } catch (error) {
            console.error("Failed to finish tournament", error);
        }
    };

    const handleGenerateBracket = async () => {
        try {
            const response = await axiosInstance.post<TournamentMatch[]>(
                `/admin/tournaments/${id}/generate-bracket`
            );
            setMatches(response.data);
            await loadGroupStandings();
        } catch (error) {
            console.error("Failed to generate bracket", error);
        }
    };

    return {
        tournament,
        participants,
        loading,
        isEditModalOpen,
        isDeleteDialogOpen,
        participantToRemove,
        initialEditData,
        setIsEditModalOpen,
        setIsDeleteDialogOpen,
        handleEditTournament,
        handleDeleteTournament,
        handleOpenRemoveParticipantDialog,
        handleConfirmRemoveParticipant,
        handleCloseRemoveParticipantDialog,
        handleStartTournament,
        handleFinishTournament,
        matches,
        handleGenerateBracket,
        groupStandings,
    };
}

export default useAdminTournamentDetails;