import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import type { TournamentType, TournamentParticipantType } from "../types/tournament";
import type { TournamentMatch, GroupStanding } from "../types/match";
import { getErrorMessage } from "../utils/getErrorMessage.ts";
import { useToast } from "../context/ToastContext.tsx";

function useTournamentData(id: string | undefined) {
    const { showToast } = useToast();
    const [tournament, setTournament] = useState<TournamentType | null>(null);
    const [participants, setParticipants] = useState<TournamentParticipantType[]>([]);
    const [matches, setMatches] = useState<TournamentMatch[]>([]);
    const [groupStandings, setGroupStandings] = useState<GroupStanding[]>([]);
    const [loading, setLoading] = useState(true);

    const loadTournament = async () => {
        try {
            const response = await axiosInstance.get<TournamentType>(`/player/tournaments/${id}`);
            setTournament(response.data);
        } catch (error) {
            showToast(getErrorMessage(error));
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
            showToast(getErrorMessage(error));
        }
    };

    const loadMatches = async () => {
        try {
            const response = await axiosInstance.get<TournamentMatch[]>(
                `/player/tournaments/${id}/matches`
            );
            setMatches(response.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const loadGroupStandings = async () => {
        try {
            const response = await axiosInstance.get<GroupStanding[]>(
                `/player/tournaments/${id}/group-standings`
            );
            setGroupStandings(response.data);
        } catch (error) {
            showToast(getErrorMessage(error));
        }
    };

    const refreshMatchData = async () => {
        await Promise.all([loadMatches(), loadGroupStandings()]);
    };

    useEffect(() => {
        if (!id) return;
        loadTournament();
        loadParticipants();
        loadMatches();
        loadGroupStandings();
    }, [id]);

    return {
        tournament,
        setTournament,
        participants,
        matches,
        setMatches,
        groupStandings,
        loading,
        loadTournament,
        loadParticipants,
        loadMatches,
        loadGroupStandings,
        refreshMatchData,
    };
}

export default useTournamentData;