import { Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentLevel } from "../../types/tournament.ts";

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
            case "Entry":
                return "#ecfeff";
            case "Starter":
                return "#f0fdf4";
            case "Medium":
                return "#eff6ff";
            case "Master":
                return "#faf5ff";
            case "Expert":
                return "#fff7ed";
            case "Stellar":
                return "#fef2f2";
            default:
                return "#f8fafc";
        }
    }};
    color: ${({ $level }) => {
        switch ($level) {
            case "Entry":
                return "#0f766e";
            case "Starter":
                return "#15803d";
            case "Medium":
                return "#1d4ed8";
            case "Master":
                return "#7e22ce";
            case "Expert":
                return "#c2410c";
            case "Stellar":
                return "#b91c1c";
            default:
                return "#334155";
        }
    }};
`;