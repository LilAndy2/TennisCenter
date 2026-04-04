import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import LocationCard from "../components/admin/LocationCard";
import LocationModal from "../components/admin/LocationModal";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentCard from "../components/tournaments/TournamentCard";
import useAdminDashboard from "../hooks/useAdminDashboard";

function AdminDashboardPage() {
    const {
        ongoingTournaments,
        upcomingTournaments,
        locations,
        loading,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isLocationModalOpen,
        editingLocation,
        locationForm,
        setLocationForm,
        openCreateLocation,
        openEditLocation,
        closeLocationModal,
        handleCreateTournament,
        handleSaveLocation,
        handleDeleteLocation,
    } = useAdminDashboard();

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <TopRow>
                    <PageTitle>Admin dashboard</PageTitle>
                    <ButtonsRow>
                        <CreateButton onClick={openCreateLocation}>
                            <Add sx={{ fontSize: 20 }} />
                            <span>Add location</span>
                        </CreateButton>
                        <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                            <Add sx={{ fontSize: 20 }} />
                            <span>Create tournament</span>
                        </CreateButton>
                    </ButtonsRow>
                </TopRow>

                {loading ? (
                    <LoadingWrapper><CircularProgress /></LoadingWrapper>
                ) : (
                    <SectionsWrapper>
                        <SectionBlock>
                            <SectionTitle>Ongoing tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {ongoingTournaments.map(t => (
                                    <HorizontalCardItem key={t.id}>
                                        <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Upcoming tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {upcomingTournaments.map(t => (
                                    <HorizontalCardItem key={t.id}>
                                        <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Locations</SectionTitle>
                            {locations.length === 0 ? (
                                <EmptyText>No locations added yet.</EmptyText>
                            ) : (
                                <LocationsGrid>
                                    {locations.map(loc => (
                                        <LocationCard
                                            key={loc.id}
                                            location={loc}
                                            onEdit={openEditLocation}
                                            onDelete={handleDeleteLocation}
                                        />
                                    ))}
                                </LocationsGrid>
                            )}
                        </SectionBlock>
                    </SectionsWrapper>
                )}
            </PageWrapper>

            <CreateTournamentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTournament}
                locations={locations}
            />

            <LocationModal
                open={isLocationModalOpen}
                editingLocation={editingLocation}
                locationForm={locationForm}
                onClose={closeLocationModal}
                onSave={handleSaveLocation}
                onChange={setLocationForm}
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
const ButtonsRow = styled(Box)`
  display: flex;
  gap: 0.75rem;
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
  &:hover { background: #059669; }
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
const SectionTitle = styled(Typography)`
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: #111827;
`;
const HorizontalCardsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 0.35rem;
  &::-webkit-scrollbar { height: 0.45rem; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
`;
const HorizontalCardItem = styled(Box)`
  flex: 0 0 calc(50% - 0.5rem);
  min-width: calc(50% - 0.5rem);
  @media (max-width: 72rem) { flex: 0 0 100%; min-width: 100%; }
`;
const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;
const EmptyText = styled(Typography)`
  color: #94a3b8;
  font-size: 0.94rem !important;
`;
const LocationsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 72rem) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 48rem) { grid-template-columns: 1fr; }
`;