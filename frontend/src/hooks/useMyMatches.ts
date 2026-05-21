import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentMatch, MatchSet } from "../types/match";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useToast } from "../context/ToastContext";

function useMyMatches() {
    const { showToast } = useToast();
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [loading, setLoading] = useState(true);

    // Score dialog state
    const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

    const loadMatches = useCallback(async () => {
        try {
            const res = await axiosInstance.get<TournamentMatch[]>("/player/matches/my-matches");
            setMatches(res.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMatches();
    }, []);

    const handleOpenScoreDialog = (match: TournamentMatch) => {
        setSelectedMatch(match);
        setIsScoreDialogOpen(true);
    };

    const handleCloseScoreDialog = () => {
        setSelectedMatch(null);
        setIsScoreDialogOpen(false);
    };

    const handleSubmitScore = async (sets: MatchSet[]) => {
        if (!selectedMatch) return;

        const payload = {
            sets: sets.map((s, i) => ({
                setNumber: i + 1,
                playerOneGames: s.playerOneGames,
                playerTwoGames: s.playerTwoGames,
                playerOneTiebreakPoints: s.playerOneTiebreakPoints ?? null,
                playerTwoTiebreakPoints: s.playerTwoTiebreakPoints ?? null,
            })),
        };

        await axiosInstance.put(`/player/matches/${selectedMatch.id}/score`, payload);
        await loadMatches();
        showToast("Score submitted successfully");
    };

    const scheduled = matches.filter((m) => m.status !== "COMPLETED");
    const completedToday = matches.filter((m) => m.status === "COMPLETED");

    return {
        matches,
        scheduled,
        completedToday,
        loading,
        isScoreDialogOpen,
        selectedMatch,
        handleOpenScoreDialog,
        handleCloseScoreDialog,
        handleSubmitScore,
    };
}

export default useMyMatches;