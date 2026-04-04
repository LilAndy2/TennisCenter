import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentMatch } from "../types/match";
import type { Location } from "../types/location";
import { useEffect } from "react";
import { getErrorMessage } from "../utils/getErrorMessage.ts";
import { useToast } from "../context/ToastContext.tsx";

const { showToast } = useToast();

function useMatchSchedule(
    onSuccess: () => Promise<void>
) {
    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [matchToSchedule, setMatchToSchedule] = useState<TournamentMatch | null>(null);
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        const loadLocations = async () => {
            try {
                const response = await axiosInstance.get<Location[]>("/admin/locations");
                setLocations(response.data);
            } catch (error) {
                showToast(getErrorMessage(error));
            }
        };
        loadLocations();
    }, []);

    const handleOpenScheduleDialog = (match: TournamentMatch) => {
        setMatchToSchedule(match);
        setIsScheduleDialogOpen(true);
    };

    const handleCloseScheduleDialog = () => {
        setMatchToSchedule(null);
        setIsScheduleDialogOpen(false);
    };

    const handleScheduleMatch = async (
        matchId: number,
        scheduledTime: string,
        courtId: number
    ) => {
        await axiosInstance.put(`/admin/matches/${matchId}/schedule`, {
            scheduledTime,
            courtId,
        });
        await onSuccess();
    };

    return {
        locations,
        isScheduleDialogOpen,
        matchToSchedule,
        handleOpenScheduleDialog,
        handleCloseScheduleDialog,
        handleScheduleMatch,
    };
}

export default useMatchSchedule;