import { ArrowBack, CalendarMonth, Group, LocationOn, SportsTennis } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentLevelBadge from "../components/tournaments/TournamentLevelBadge";
import { mockTournaments } from "../data/mockTournaments";

function TournamentDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const tournament = useMemo(
        () => mockTournaments.find((item) => item.id === Number(id)),
        [id]
    );

    if (!tournament) {
        return (
            <AuthenticatedLayout>
                <PageWrapper>
                    <BackButton onClick={() => navigate("/tournaments")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to tournaments</span>
                    </BackButton>

                    <EmptyStateTitle>Tournament not found</EmptyStateTitle>
                </PageWrapper>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <BackButton onClick={() => navigate("/tournaments")}>
                    <ArrowBack sx={{ fontSize: 18 }} />
                    <span>Back to tournaments</span>
                </BackButton>

                <DetailsCard>
                    <TopRow>
                        <TournamentLevelBadge level={tournament.level} />
                        <StatusText>{tournament.status}</StatusText>
                    </TopRow>

                    <Title>{tournament.name}</Title>
                    <Description>{tournament.description}</Description>

                    <DetailsList>
                        <DetailRow>
                            <CalendarMonth sx={{ fontSize: 18 }} />
                            <span>{tournament.startDate} → {tournament.endDate}</span>
                        </DetailRow>

                        <DetailRow>
                            <Group sx={{ fontSize: 18 }} />
                            <span>{tournament.currentPlayers}/{tournament.maxPlayers} players accepted</span>
                        </DetailRow>

                        <DetailRow>
                            <LocationOn sx={{ fontSize: 18 }} />
                            <span>{tournament.location}</span>
                        </DetailRow>

                        <DetailRow>
                            <SportsTennis sx={{ fontSize: 18 }} />
                            <span>{tournament.surface}</span>
                        </DetailRow>
                    </DetailsList>
                </DetailsCard>
            </PageWrapper>
        </AuthenticatedLayout>
    );
}

export default TournamentDetailsPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 56rem;
  margin: 0 auto;
`;

const BackButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

const DetailsCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.25rem;
  padding: 1.5rem;
  box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.05);
`;

const TopRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatusText = styled(Typography)`
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: #64748b;
`;

const Title = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.6rem !important;
`;

const Description = styled(Typography)`
  font-size: 1rem !important;
  color: #64748b;
  line-height: 1.7 !important;
  margin-bottom: 1.2rem !important;
`;

const DetailsList = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

const DetailRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: #334155;
  font-size: 0.96rem;
`;

const EmptyStateTitle = styled(Typography)`
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  color: #111827;
`;