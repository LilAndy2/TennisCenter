import { CalendarMonth, Group, LocationOn, SportsTennis } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { TournamentType } from "../../types/tournament.ts";
import { formatTournamentDateRange } from "../../utils/formatTournamentDateRange";
import TournamentLevelBadge from "./TournamentLevelBadge";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../../styles/theme";

type TournamentCardProps = {
    tournament: TournamentType;
    detailsPath?: string;
};

function TournamentCard({ tournament, detailsPath }: TournamentCardProps) {
    const navigate = useNavigate();

    const targetPath = detailsPath ?? `/tournaments/${tournament.id}`;

    return (
        <CardWrapper onClick={() => navigate(targetPath)}>
            <TopSection>
                <TournamentLevelBadge level={tournament.level} />

                <RightBadges>
                    <StatusBadge $status={tournament.status}>
                        {tournament.status}
                    </StatusBadge>

                    {tournament.status === "Upcoming" && tournament.isFull ? (
                        <FullBadge>Full</FullBadge>
                    ) : null}
                </RightBadges>
            </TopSection>

            <TournamentName>{tournament.name}</TournamentName>
            <TournamentDescription>{tournament.description}</TournamentDescription>

            <DetailsRow>
                <DetailChip>
                    <CalendarMonth sx={{ fontSize: 16 }} />
                    <span>{formatTournamentDateRange(tournament.startDate, tournament.endDate)}</span>
                </DetailChip>

                <DetailChip>
                    <Group sx={{ fontSize: 16 }} />
                    <span>{tournament.maxPlayers} players</span>
                </DetailChip>

                <DetailChip>
                    <LocationOn sx={{ fontSize: 16 }} />
                    <span>{tournament.locationNames?.join(", ") || "TBD"}</span>
                </DetailChip>

                <DetailChip>
                    <SportsTennis sx={{ fontSize: 16 }} />
                    <span>{tournament.surface}</span>
                </DetailChip>
            </DetailsRow>
        </CardWrapper>
    );
}

export default TournamentCard;

const CardWrapper = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    box-shadow: ${shadow.sm};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadow.lg};
        border-color: ${colors.borderGreen};
    }

    &:active {
        transform: translateY(0);
    }
`;

const TopSection = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${spacing.md};
    margin-bottom: ${spacing.sm};
`;

const StatusBadge = styled(Typography)<{ $status: string }>`
    width: fit-content;
    padding: 0.3rem 0.7rem;
    border-radius: ${radius.pill};
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.black} !important;
    background: ${({ $status }) => colors.status[$status]?.bg ?? colors.surfaceAlt};
    color: ${({ $status }) => colors.status[$status]?.text ?? colors.textSecondary};
`;

const TournamentName = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    margin-bottom: 0.35rem !important;
`;

const TournamentDescription = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
    line-height: 1.6 !important;
    margin-bottom: ${spacing.md} !important;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

const DetailsRow = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.xs};
`;

const DetailChip = styled(Box)`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.medium};
    white-space: nowrap;
`;

const RightBadges = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
`;

const FullBadge = styled(Typography)`
    width: fit-content;
    padding: 0.3rem 0.7rem;
    border-radius: ${radius.pill};
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.black} !important;
    background: ${colors.dangerBg};
    color: ${colors.danger};
`;