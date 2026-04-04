import TournamentInfoCard from "../../tournaments/TournamentInfoCard";
import type { TournamentType } from "../../../types/tournament";

type AdminTournamentInfoCardProps = {
    tournament: TournamentType;
};

function AdminTournamentInfoCard({ tournament }: AdminTournamentInfoCardProps) {
    return <TournamentInfoCard tournament={tournament} />;
}

export default AdminTournamentInfoCard;