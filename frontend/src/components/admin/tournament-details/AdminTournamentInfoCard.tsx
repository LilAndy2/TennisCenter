import {
    CalendarMonth,
    EmojiEventsOutlined,
    Group,
    LocationOn,
    SportsScore,
    SportsTennis,
} from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import TournamentLevelBadge from "../../tournaments/TournamentLevelBadge";
import type { TournamentType } from "../../../types/tournament";
import { formatTournamentDateRange } from "../../../utils/formatTournamentDateRange";

type AdminTournamentInfoCardProps = {
    tournament: TournamentType;
};

function AdminTournamentInfoCard({
                                     tournament,
                                 }: AdminTournamentInfoCardProps) {
    return (
        <HeroCard>
            <TopBadgesRow>
                <LeftBadges>
                    <TournamentLevelBadge level={tournament.level} />
                    <StatusBadge $status={tournament.status}>
                        {tournament.status}
                    </StatusBadge>
                    {tournament.status === "Upcoming" && tournament.isFull ? (
                        <FullBadge>Full</FullBadge>
                    ) : null}
                </LeftBadges>
            </TopBadgesRow>

            <TournamentTitle>{tournament.name}</TournamentTitle>
            <TournamentDescription>{tournament.description}</TournamentDescription>

            <InfoGrid>
                <InfoItem>
                    <InfoIconWrapper>
                        <CalendarMonth sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Tournament period</InfoLabel>
                        <InfoValue>
                            {formatTournamentDateRange(
                                tournament.startDate,
                                tournament.endDate
                            )}
                        </InfoValue>
                    </InfoTextBlock>
                </InfoItem>

                <InfoItem>
                    <InfoIconWrapper>
                        <Group sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Players</InfoLabel>
                        <InfoValue>
                            {tournament.currentPlayers}/{tournament.maxPlayers} players
                        </InfoValue>
                    </InfoTextBlock>
                </InfoItem>

                <InfoItem>
                    <InfoIconWrapper>
                        <LocationOn sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Location</InfoLabel>
                        <InfoValue>{tournament.locationNames?.join(", ") || "No locations assigned"}</InfoValue>
                    </InfoTextBlock>
                </InfoItem>

                <InfoItem>
                    <InfoIconWrapper>
                        <SportsTennis sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Surface</InfoLabel>
                        <InfoValue>{tournament.surface}</InfoValue>
                    </InfoTextBlock>
                </InfoItem>

                <InfoItem>
                    <InfoIconWrapper>
                        <EmojiEventsOutlined sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Bracket type</InfoLabel>
                        <InfoValue>{tournament.bracketType}</InfoValue>
                    </InfoTextBlock>
                </InfoItem>

                <InfoItem>
                    <InfoIconWrapper>
                        <SportsScore sx={{ fontSize: 20 }} />
                    </InfoIconWrapper>
                    <InfoTextBlock>
                        <InfoLabel>Tournament status</InfoLabel>
                        <InfoValue>{tournament.status}</InfoValue>
                    </InfoTextBlock>
                </InfoItem>
            </InfoGrid>
        </HeroCard>
    );
}

export default AdminTournamentInfoCard;

const HeroCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.4rem;
  padding: 1.6rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.035);
  margin-bottom: 1.2rem;
`;

const TopBadgesRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const LeftBadges = styled(Box)`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
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
            return "#eff6ff";
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
            return "#1d4ed8";
        case "Ongoing":
            return "#059669";
        case "Finished":
            return "#64748b";
        default:
            return "#334155";
    }
}};
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

const TournamentTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.55rem !important;
`;

const TournamentDescription = styled(Typography)`
  font-size: 1rem !important;
  color: #64748b;
  line-height: 1.7 !important;
  margin-bottom: 1.3rem !important;
  max-width: 52rem;
`;

const InfoGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 56rem) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled(Box)`
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  background: #f8fafc;
`;

const InfoIconWrapper = styled(Box)`
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 0.8rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #475569;
  flex-shrink: 0;
`;

const InfoTextBlock = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

const InfoLabel = styled(Typography)`
  font-size: 0.8rem !important;
  font-weight: 700 !important;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const InfoValue = styled(Typography)`
  font-size: 0.96rem !important;
  font-weight: 600 !important;
  color: #111827;
  line-height: 1.5 !important;
`;