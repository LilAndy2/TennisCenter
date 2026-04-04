import { useParams } from "react-router-dom";
import useTournamentData from "./useTournamentData";
import useTournamentRegistration from "./useTournamentRegistration";

function useTournamentDetails() {
    const { id } = useParams();

    const dataHook = useTournamentData(id);

    const registrationHook = useTournamentRegistration({
        tournament: dataHook.tournament,
        setTournament: dataHook.setTournament,
        refreshAll: dataHook.refreshMatchData,
    });

    return {
        tournament: dataHook.tournament,
        loading: dataHook.loading,
        participants: dataHook.participants,
        matches: dataHook.matches,
        groupStandings: dataHook.groupStandings,
        ...registrationHook,
    };
}

export default useTournamentDetails;