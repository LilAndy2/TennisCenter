import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentType } from "../types/tournament";
import type { TournamentFormData } from "../types/forms";
import useLocationManagement from "./useLocationManagement";
import { getErrorMessage } from "../utils/getErrorMessage.ts";
import { useToast } from "../context/ToastContext.tsx";

const { showToast } = useToast();

function useAdminDashboard() {
    const [ongoingTournaments, setOngoingTournaments] = useState<TournamentType[]>([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const locationHook = useLocationManagement();

    const loadTournaments = async () => {
        try {
            const [ongoingRes, upcomingRes] = await Promise.all([
                axiosInstance.get<TournamentType[]>("/admin/tournaments/ongoing"),
                axiosInstance.get<TournamentType[]>("/admin/tournaments/upcoming"),
            ]);
            setOngoingTournaments(ongoingRes.data);
            setUpcomingTournaments(upcomingRes.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTournaments();
    }, []);

    const handleCreateTournament = async (data: TournamentFormData) => {
        try {
            await axiosInstance.post("/admin/tournaments", {
                name: data.name,
                level: data.level,
                bracketType: data.bracketType,
                surface: data.surface,
                startDate: data.startDate,
                endDate: data.endDate,
                maxPlayers: Number(data.maxPlayers),
                locationIds: data.locationIds,
                description: data.description,
            });
            await loadTournaments();
        } catch (error) {
            showToast(getErrorMessage(error));
            throw error;
        }
    };

    return {
        ongoingTournaments,
        upcomingTournaments,
        loading,
        isCreateModalOpen,
        setIsCreateModalOpen,
        handleCreateTournament,
        ...locationHook,
    };
}

export default useAdminDashboard;