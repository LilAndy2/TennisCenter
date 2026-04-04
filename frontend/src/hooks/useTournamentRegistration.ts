import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentType } from "../types/tournament";

type UseTournamentRegistrationParams = {
    tournament: TournamentType | null;
    setTournament: (t: TournamentType) => void;
    refreshAll: () => Promise<void>;
};

function useTournamentRegistration({
                                       tournament,
                                       setTournament,
                                       refreshAll,
                                   }: UseTournamentRegistrationParams) {
    const [registering, setRegistering] = useState(false);

    const handleRegister = async () => {
        if (!tournament) return;
        try {
            setRegistering(true);
            const response = await axiosInstance.post<TournamentType>(
                `/player/tournaments/${tournament.id}/register`
            );
            setTournament(response.data);
            await refreshAll();
        } catch (error) {
            console.error("Failed to register", error);
        } finally {
            setRegistering(false);
        }
    };

    const handleWithdraw = async () => {
        if (!tournament) return;
        try {
            setRegistering(true);
            const response = await axiosInstance.delete<TournamentType>(
                `/player/tournaments/${tournament.id}/register`
            );
            setTournament(response.data);
            await refreshAll();
        } catch (error) {
            console.error("Failed to withdraw", error);
        } finally {
            setRegistering(false);
        }
    };

    return { registering, handleRegister, handleWithdraw };
}

export default useTournamentRegistration;