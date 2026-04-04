import axiosInstance from "../api/axiosInstance";
import type { TournamentType } from "../types/tournament";
import type { TournamentMatch } from "../types/match";
import type { TournamentFormData } from "../types/forms";

type UseTournamentAdminParams = {
    id: string | undefined;
    setTournament: (t: TournamentType) => void;
    setMatches: (m: TournamentMatch[]) => void;
    loadGroupStandings: () => Promise<void>;
    setIsEditModalOpen: (open: boolean) => void;
    setIsDeleteDialogOpen: (open: boolean) => void;
};

function useTournamentAdmin({
                                id,
                                setTournament,
                                setMatches,
                                loadGroupStandings,
                                setIsEditModalOpen,
                                setIsDeleteDialogOpen,
                            }: UseTournamentAdminParams) {

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
                    locationIds: data.locationIds,
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

    const handleStartTournament = async () => {
        try {
            const response = await axiosInstance.post<TournamentType>(
                `/admin/tournaments/${id}/start`
            );
            setTournament(response.data);
        } catch (error) {
            console.error("Failed to start tournament", error);
        }
    };

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
        handleEditTournament,
        handleDeleteTournament,
        handleStartTournament,
        handleFinishTournament,
        handleGenerateBracket,
    };
}

export default useTournamentAdmin;