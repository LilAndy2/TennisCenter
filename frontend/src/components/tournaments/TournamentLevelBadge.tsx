import { Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentLevel } from "../../data/mockTournaments.ts";

type TournamentLevelBadgeProps = {
    level: TournamentLevel;
};

function TournamentLevelBadge({ level }: TournamentLevelBadgeProps) {
    return <BadgeWrapper $level={level}>{level}</BadgeWrapper>;
}

export default TournamentLevelBadge;

const BadgeWrapper = styled(Typography)<{ $level: TournamentLevel} >`
    width: fit-content;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-size: 0.78rem !important;
    font-weight: 800 !important;
    letter-spacing: 0.02em;
    background: ${({ $level }) => {
        switch ($level) {
            case "ENTRY":
                return "#ecfeff";
            case "STARTER":
                return "#f0fdf4";
            case "MEDIUM":
                return "#eff6ff";
            case "MASTER":
                return "#faf5ff";
            case "EXPERT":
                return "#fff7ed";
            case "STELAR":
                return "#fef2f2";
            default:
                return "#f8fafc";
        }
    }};
    color: ${({ $level }) => {
        switch ($level) {
            case "ENTRY":
                return "#0f766e";
            case "STARTER":
                return "#15803d";
            case "MEDIUM":
                return "#1d4ed8";
            case "MASTER":
                return "#7e22ce";
            case "EXPERT":
                return "#c2410c";
            case "STELAR":
                return "#b91c1c";
            default:
                return "#334155";
        }
    }};
`;