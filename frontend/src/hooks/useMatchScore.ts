import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentMatch, MatchSet } from "../types/match";
import { getErrorMessage } from "../utils/getErrorMessage.ts";
import { useToast } from "../context/ToastContext.tsx";

const { showToast } = useToast();

function useMatchScore(
    onSuccess: () => Promise<void>
) {
    const [isUpdateScoreDialogOpen, setIsUpdateScoreDialogOpen] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

    const handleOpenUpdateScoreDialog = (match: TournamentMatch) => {
        setSelectedMatch(match);
        setIsUpdateScoreDialogOpen(true);
    };

    const handleCloseUpdateScoreDialog = () => {
        setSelectedMatch(null);
        setIsUpdateScoreDialogOpen(false);
    };

    const handleSubmitMatchScore = async (sets: MatchSet[]) => {
        if (!selectedMatch) return;
        try {
            await axiosInstance.put(`/admin/matches/${selectedMatch.id}/score`, {
                sets: sets.map(set => ({
                    setNumber: set.setNumber,
                    playerOneGames: set.playerOneGames,
                    playerTwoGames: set.playerTwoGames,
                    playerOneTiebreakPoints: set.playerOneTiebreakPoints ?? null,
                    playerTwoTiebreakPoints: set.playerTwoTiebreakPoints ?? null,
                })),
            });
            await onSuccess();
            setIsUpdateScoreDialogOpen(false);
            setSelectedMatch(null);
        } catch (error) {
            showToast(getErrorMessage(error));
            throw error;
        }
    };

    return {
        isUpdateScoreDialogOpen,
        selectedMatch,
        handleOpenUpdateScoreDialog,
        handleCloseUpdateScoreDialog,
        handleSubmitMatchScore,
    };
}

export default useMatchScore;