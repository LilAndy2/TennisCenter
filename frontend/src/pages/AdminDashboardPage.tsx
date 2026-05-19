import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import styled from "styled-components";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import LocationsTable from "../components/admin/LocationsTable";
import DeleteLocationDialog from "../components/admin/DeleteLocationDialog";
import LocationModal from "../components/admin/LocationModal";
import PlayersManagementSection from "../components/admin/PlayersManagementSection";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedCard, AnimatedPage } from "../components/animated";
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
import { useState } from "react";
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
                    <PageTitle>Admin dashboard</PageTitle>

                    {loading ? (
                        <LoadingWrapper><CircularProgress /></LoadingWrapper>
                    ) : (
                        <SectionsWrapper>
                            <SectionCard>
                                <SectionHeader>
                                    <SectionTitle>Tournaments</SectionTitle>
                                    <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                                        <Add sx={{ fontSize: 18 }} />
                                        <span>Create tournament</span>
                                    </CreateButton>
                                </SectionHeader>

                                <SubSectionBlock>
                                    <SubSectionTitle>Ongoing</SubSectionTitle>
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
                                </SubSectionBlock>

                                <SectionDivider />

                                <SubSectionBlock>
                                    <SubSectionTitle>Upcoming</SubSectionTitle>
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
                                </SubSectionBlock>
                            </SectionCard>

                            <LocationsTable
                                locations={locations}
                                onAdd={openCreateLocation}
                                onEdit={openEditLocation}
                                onDelete={(loc) => setLocationToDelete(loc)}
                            />

                            <PlayersManagementSection />
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

const SectionsWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xl};
    margin-top: ${spacing.lg};
`;

const SectionCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    box-shadow: ${shadow.sm};
    overflow: hidden;
    padding: ${spacing.lg};
`;

const SectionHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.md}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SectionTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    white-space: nowrap;
`;

const SubSectionBlock = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.sm};
`;

const SubSectionTitle = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textSecondary};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: ${fontSize.xs} !important;
`;

const SectionDivider = styled(Box)`
    height: 1px;
    background: ${colors.border};
    margin: ${spacing.md} 0;
`;

const CreateButton = styled.button`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    transition: all ${transition.normal};
    white-space: nowrap;

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const HorizontalCardsRow = styled(Box)`
    display: flex;
    gap: ${spacing.md};
    overflow-x: auto;
    padding-top: 0.35rem;
    padding-bottom: ${spacing.xs};

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