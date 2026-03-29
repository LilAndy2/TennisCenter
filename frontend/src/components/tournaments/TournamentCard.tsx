import { CalendarMonth, Group, LocationOn, SportsTennis } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import type { TournamentType } from "../../types/tournament.ts";
import { formatTournamentDateRange } from "../../utils/formatTournamentDateRange";
import TournamentLevelBadge from "./TournamentLevelBadge";

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

            <DetailsGrid>
                <DetailItem>
                    <CalendarMonth sx={{ fontSize: 18 }} />
                    <DetailText>
                        {formatTournamentDateRange(tournament.startDate, tournament.endDate)}
                    </DetailText>
                </DetailItem>

                <DetailItem>
                    <Group sx={{ fontSize: 18 }} />
                    <DetailText>
                        Max {tournament.maxPlayers} players
                    </DetailText>
                </DetailItem>

                <DetailItem>
                    <LocationOn sx={{ fontSize: 18 }} />
                    <DetailText>{tournament.location}</DetailText>
                </DetailItem>

                <DetailItem>
                    <SportsTennis sx={{ fontSize: 18 }} />
                    <DetailText>{tournament.surface}</DetailText>
                </DetailItem>
            </DetailsGrid>
        </CardWrapper>
    );
}

export default TournamentCard;

const CardWrapper = styled(Box)`
    background: white;
    border: 1px solid #d1fae5;
    border-radius: 1.25rem;
    padding: 1.2rem;
    box-shadow: 0 0.75rem 2rem rgba(5, 150, 105, 0.06);
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
        transform: translateY(-0.15rem);
        box-shadow: 0 1rem 2.2rem rgba(5, 150, 105, 0.12);
        border-color: #86efac;
    }
`;

const TopSection = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
`;

const StatusBadge = styled(Typography)<{ $status: string }>`
    width: fit-content;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem !important;
    font-weight: 800 !important;
    background: ${({ $status }) => {
        switch ($status) {
            case "Upcoming":
                return "#dcfce7";
            case "Ongoing":
                return "#ecfdf5";
            case "Finished":
                return "#f1f5f9";
            default:
                return "#f8fafc";
        }
    }};
    color: ${({ $status }) => {
        switch ($status) {
            case "Upcoming":
                return "#047857";
            case "Ongoing":
                return "#059669";
            case "Finished":
                return "#64748b";
            default:
                return "#334155";
        }
    }};
`;

const TournamentName = styled(Typography)`
    font-size: 1.15rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 0.45rem !important;
`;

const TournamentDescription = styled(Typography)`
    font-size: 0.92rem !important;
    color: #64748b;
    line-height: 1.6 !important;
    margin-bottom: 1rem !important;
`;

const DetailsGrid = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;

    @media (max-width: 40rem) {
        grid-template-columns: 1fr;
    }
`;

const DetailItem = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #334155;
`;

const DetailText = styled(Typography)`
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  color: #334155;
  letter-spacing: 0.01em;
`;

const RightBadges = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FullBadge = styled(Typography)`
  width: fit-content;
  padding: 0.35rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem !important;
  font-weight: 800 !important;
  background: #fee2e2;
  color: #b91c1c;
`;