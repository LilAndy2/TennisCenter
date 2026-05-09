import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import LocationsTable from "../components/admin/LocationsTable";
import DeleteLocationDialog from "../components/admin/DeleteLocationDialog";
import LocationModal from "../components/admin/LocationModal";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import {AnimatedCard, AnimatedPage} from "../components/animated";
import TournamentCard from "../components/tournaments/TournamentCard";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    LoadingWrapper,
} from "../components/common/PageLayout";
import useAdminDashboard from "../hooks/useAdminDashboard";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../styles/theme";
import {useState} from "react";
import type { Location } from "../types/location";

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

    const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <TopRow>
                        <PageTitle>Admin dashboard</PageTitle>
                        <ButtonsRow>
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
                                {ongoingTournaments.length === 0 ? (
                                    <EmptyText>No ongoing tournaments.</EmptyText>
                                ) : (
                                    <HorizontalCardsRow>
                                        {ongoingTournaments.map((t, index) => (
                                            <HorizontalCardItem key={t.id}>
                                                <AnimatedCard index={index}>
                                                    <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                                </AnimatedCard>
                                            </HorizontalCardItem>
                                        ))}
                                    </HorizontalCardsRow>
                                )}
                            </SectionBlock>

                            <SectionBlock>
                                <SectionTitle>Upcoming tournaments</SectionTitle>
                                {upcomingTournaments.length === 0 ? (
                                    <EmptyText>No upcoming tournaments.</EmptyText>
                                ) : (
                                    <HorizontalCardsRow>
                                        {upcomingTournaments.map((t, index) => (
                                            <HorizontalCardItem key={t.id}>
                                                <AnimatedCard index={index}>
                                                    <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                                </AnimatedCard>
                                            </HorizontalCardItem>
                                        ))}
                                    </HorizontalCardsRow>
                                )}
                            </SectionBlock>

                            <LocationsTable
                                locations={locations}
                                onAdd={openCreateLocation}
                                onEdit={openEditLocation}
                                onDelete={(loc) => setLocationToDelete(loc)}
                            />
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

                <DeleteLocationDialog
                    open={Boolean(locationToDelete)}
                    locationName={locationToDelete?.name}
                    onClose={() => setLocationToDelete(null)}
                    onConfirm={async () => {
                        if (locationToDelete) {
                            await handleDeleteLocation(locationToDelete.id);
                            setLocationToDelete(null);
                        }
                    }}
                />
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default AdminDashboardPage;

const PageWrapper = styled(BasePageWrapper)`
    max-width: 80rem;
`;

const TopRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.lg};
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.md}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const ButtonsRow = styled(Box)`
    display: flex;
    gap: ${spacing.sm};
`;

const CreateButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const SectionsWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl};
`;

const SectionBlock = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const SectionTitle = styled(Typography)`
    font-size: 1.2rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const HorizontalCardsRow = styled(Box)`
    display: flex;
    gap: ${spacing.md};
    overflow-x: auto;
    padding-top: 0.35rem;
    padding-bottom: ${spacing.xs};

    /* Scroll fade hint */
    mask-image: linear-gradient(to right, black calc(100% - 2rem), transparent 100%);
    -webkit-mask-image: linear-gradient(to right, black calc(100% - 2rem), transparent 100%);
`;

const HorizontalCardItem = styled(Box)`
    flex: 0 0 calc(50% - 0.5rem);
    min-width: calc(50% - 0.5rem);

    @media (max-width: 72rem) {
        flex: 0 0 100%;
        min-width: 100%;
    }
`;

const EmptyText = styled(Typography)`
    color: ${colors.textHint};
    font-size: ${fontSize.base} !important;
`;