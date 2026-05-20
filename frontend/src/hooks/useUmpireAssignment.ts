import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentMatch } from "../types/match";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useToast } from "../context/ToastContext";

function useUmpireAssignment(onSuccess: () => Promise<void>) {
    const { showToast } = useToast();
    const [isUmpireDialogOpen, setIsUmpireDialogOpen] = useState(false);
    const [matchForUmpire, setMatchForUmpire] = useState<TournamentMatch | null>(null);

    const handleOpenUmpireDialog = (match: TournamentMatch) => {
        setMatchForUmpire(match);
        setIsUmpireDialogOpen(true);
    };

    const handleCloseUmpireDialog = () => {
        setMatchForUmpire(null);
        setIsUmpireDialogOpen(false);
    };

    const handleAssignUmpire = async (matchId: number, umpireId: number) => {
        try {
            await axiosInstance.put(`/admin/matches/${matchId}/umpire`, { umpireId });
            await onSuccess();
            showToast("Umpire assigned successfully");
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const handleRemoveUmpire = async (matchId: number) => {
        try {
            await axiosInstance.delete(`/admin/matches/${matchId}/umpire`);
            await onSuccess();
            showToast("Umpire removed successfully");
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    return {
        isUmpireDialogOpen,
        matchForUmpire,
        handleOpenUmpireDialog,
        handleCloseUmpireDialog,
        handleAssignUmpire,
        handleRemoveUmpire,
    };
}

export default useUmpireAssignment;