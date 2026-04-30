import { Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentLevel } from "../../types/tournament.ts";
import { colors, fontSize, fontWeight, radius } from "../../styles/theme";

type TournamentLevelBadgeProps = {
    level: TournamentLevel;
};

function TournamentLevelBadge({ level }: TournamentLevelBadgeProps) {
    const levelColors = colors.levels[level] ?? { bg: "#f8fafc", text: "#334155" };

    return (
        <BadgeWrapper $bg={levelColors.bg} $color={levelColors.text}>
            {level}
        </BadgeWrapper>
    );
}

export default TournamentLevelBadge;

const BadgeWrapper = styled(Typography)<{ $bg: string; $color: string }>`
    width: fit-content;
    padding: 0.3rem 0.7rem;
    border-radius: ${radius.pill};
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.black} !important;
    letter-spacing: 0.02em;
    background: ${({ $bg }) => $bg};
    color: ${({ $color }) => $color};
`;