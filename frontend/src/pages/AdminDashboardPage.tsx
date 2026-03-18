import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentCard from "../components/tournaments/TournamentCard";
import type { TournamentType } from "../types/tournament";

type CreateTournamentFormData = {
    name: string;
    level: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    location: string;
    description: string;
};

function AdminDashboardPage() {
    const [ongoingTournaments, setOngoingTournaments] = useState<TournamentType[]>([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const loadTournaments = async () => {
        try {
            const [ongoingResponse, upcomingResponse] = await Promise.all([
                axiosInstance.get<TournamentType[]>("/admin/tournaments/ongoing"),
                axiosInstance.get<TournamentType[]>("/admin/tournaments/upcoming"),
            ]);

            setOngoingTournaments(ongoingResponse.data);
            setUpcomingTournaments(upcomingResponse.data);
        } catch (error) {
            console.error("Failed to load admin tournaments", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTournaments();
    }, []);

    const handleCreateTournament = async (data: CreateTournamentFormData) => {
        try {
            await axiosInstance.post("/admin/tournaments", {
                name: data.name,
                level: data.level,
                surface: data.surface,
                startDate: data.startDate,
                endDate: data.endDate,
                maxPlayers: Number(data.maxPlayers),
                location: data.location,
                description: data.description,
            });

            await loadTournaments();
        } catch (error) {
            console.error("Failed to create tournament", error);
            throw error;
        }
    };

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <TopRow>
                    <PageTitle>Admin dashboard</PageTitle>

                    <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                        <Add sx={{ fontSize: 20 }} />
                        <span>Create tournament</span>
                    </CreateButton>
                </TopRow>

                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                ) : (
                    <SectionsWrapper>
                        <SectionBlock>
                            <SectionTitle>Ongoing tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {ongoingTournaments.map((tournament) => (
                                    <HorizontalCardItem key={tournament.id}>
                                        <TournamentCard tournament={tournament} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Upcoming tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {upcomingTournaments.map((tournament) => (
                                    <HorizontalCardItem key={tournament.id}>
                                        <TournamentCard tournament={tournament} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>
                    </SectionsWrapper>
                )}
            </PageWrapper>

            <CreateTournamentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTournament}
            />
        </AuthenticatedLayout>
    );
}

export default AdminDashboardPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
`;

const TopRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
`;

const CreateButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
`;

const SectionsWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
`;

const SectionBlock = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
`;

const HorizontalCardsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 0.35rem;
  border-radius: 1.25rem;

  &::-webkit-scrollbar {
    height: 0.45rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
`;

const HorizontalCardItem = styled(Box)`
  flex: 0 0 calc(50% - 0.5rem);
  min-width: calc(50% - 0.5rem);

  @media (max-width: 72rem) {
    flex: 0 0 100%;
    min-width: 100%;
  }
`;

const SectionTitle = styled(Typography)`
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: #111827;
`;

const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;