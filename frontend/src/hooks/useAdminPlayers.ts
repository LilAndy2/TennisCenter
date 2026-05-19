import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../utils/getErrorMessage";

export type AdminPlayer = {
    id: number;
    username: string;
    fullName: string;
    email: string;
    playerLevel: string | null;
    roles: string[];
    wins: number;
    losses: number;
    rankingPoints: number;
};

export type PlayerLevel = "ENTRY" | "STARTER" | "MEDIUM" | "MASTER" | "EXPERT" | "STELLAR";

const levels: PlayerLevel[] = ["ENTRY", "STARTER", "MEDIUM", "MASTER", "EXPERT", "STELLAR"];

function useAdminPlayers() {
    const { showToast } = useToast();
    
    const [selectedLevel, setSelectedLevel] = useState<PlayerLevel>("ENTRY");
    const [playerSearch, setPlayerSearch] = useState("");
    const [players, setPlayers] = useState<AdminPlayer[]>([]);
    const [playersLoading, setPlayersLoading] = useState(false);

    const [umpireSearch, setUmpireSearch] = useState("");
    const [umpires, setUmpires] = useState<AdminPlayer[]>([]);
    const [umpiresLoading, setUmpiresLoading] = useState(false);

    const [isAddUmpireOpen, setIsAddUmpireOpen] = useState(false);
    const [umpireSearchQuery, setUmpireSearchQuery] = useState("");
    const [umpireCandidates, setUmpireCandidates] = useState<AdminPlayer[]>([]);
    const [umpireCandidatesLoading, setUmpireCandidatesLoading] = useState(false);

    const loadPlayers = useCallback(async () => {
        setPlayersLoading(true);
        try {
            const res = await axiosInstance.get<AdminPlayer[]>("/admin/players", {
                params: { level: selectedLevel, search: playerSearch },
            });
            setPlayers(res.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        } finally {
            setPlayersLoading(false);
        }
    }, [selectedLevel, playerSearch]);

    const loadUmpires = useCallback(async () => {
        setUmpiresLoading(true);
        try {
            const res = await axiosInstance.get<AdminPlayer[]>("/admin/players/umpires", {
                params: { search: umpireSearch },
            });
            setUmpires(res.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        } finally {
            setUmpiresLoading(false);
        }
    }, [umpireSearch]);

    useEffect(() => {
        loadPlayers();
    }, [selectedLevel]);

    useEffect(() => {
        loadUmpires();
    }, []);

    const handlePlayerSearch = () => {
        loadPlayers();
    };

    const handleUmpireSearch = () => {
        loadUmpires();
    };

    const handleChangeLevel = async (userId: number, newLevel: string) => {
        try {
            await axiosInstance.put(`/admin/players/${userId}/level`, {
                playerLevel: newLevel,
            });
            await loadPlayers();
            showToast("Player level updated successfully");
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const searchUmpireCandidates = useCallback(async (query: string) => {
        setUmpireSearchQuery(query);
        if (!query.trim()) {
            setUmpireCandidates([]);
            return;
        }
        setUmpireCandidatesLoading(true);
        try {
            const res = await axiosInstance.get<AdminPlayer[]>("/admin/players/search-for-umpire", {
                params: { search: query },
            });
            setUmpireCandidates(res.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        } finally {
            setUmpireCandidatesLoading(false);
        }
    }, []);

    const handleAddUmpire = async (userId: number) => {
        try {
            await axiosInstance.post(`/admin/players/${userId}/umpire-role`);
            await loadUmpires();
            // Re-search to remove newly added umpire from candidates
            if (umpireSearchQuery.trim()) {
                await searchUmpireCandidates(umpireSearchQuery);
            }
            showToast("Umpire role added successfully");
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const handleRemoveUmpire = async (userId: number) => {
        try {
            await axiosInstance.delete(`/admin/players/${userId}/umpire-role`);
            await loadUmpires();
            showToast("Umpire role removed successfully");
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    return {
        // Players
        levels,
        selectedLevel,
        setSelectedLevel,
        playerSearch,
        setPlayerSearch,
        players,
        playersLoading,
        handlePlayerSearch,
        handleChangeLevel,

        // Umpires
        umpireSearch,
        setUmpireSearch,
        umpires,
        umpiresLoading,
        handleUmpireSearch,
        handleRemoveUmpire,

        // Add umpire modal
        isAddUmpireOpen,
        setIsAddUmpireOpen,
        umpireSearchQuery,
        umpireCandidates,
        umpireCandidatesLoading,
        searchUmpireCandidates,
        handleAddUmpire,
    };
}

export default useAdminPlayers;