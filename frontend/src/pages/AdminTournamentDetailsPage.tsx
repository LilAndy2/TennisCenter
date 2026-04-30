import { Box, CircularProgress} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import AdminTournamentHeader from "../components/admin/tournament-details/AdminTournamentHeader";
import AdminTournamentInfoCard from "../components/admin/tournament-details/AdminTournamentInfoCard";
import AdminTournamentParticipantsCard from "../components/admin/tournament-details/AdminTournamentParticipantsCard";
import DeleteTournamentDialog from "../components/admin/tournament-details/DeleteTournamentDialog";
import RemoveParticipantDialog from "../components/admin/tournament-details/RemoveParticipantDialog";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import AdminTournamentStatusActions from "../components/admin/tournament-details/AdminTournamentStatusAction.tsx";
import useAdminTournamentDetails from "../hooks/useAdminTournamentDetails";
import AdminTournamentGroupsCard from "../components/admin/tournament-details/AdminTournamentGroupsCard.tsx";
import UpdateMatchScoreDialog from "../components/admin/tournament-details/UpdateMatchScoreDialog.tsx";
import ScheduleMatchDialog from "../components/admin/tournament-details/ScheduleMatchDialog.tsx";
import { AnimatedPage } from "../components/animated";
import {
    NarrowPageWrapper,
    LoadingWrapper,
} from "../components/common/PageLayout";
import {
    NotFoundCard,
    NotFoundTitle,
    NotFoundText,
} from "../components/common/SectionCard";
import {
    spacing,
    breakpoints,
} from "../styles/theme";

function AdminTournamentDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const {
        tournament,
        participants,
        loading,
        isEditModalOpen,
        isDeleteDialogOpen,
        participantToRemove,
        initialEditData,
        setIsEditModalOpen,
        setIsDeleteDialogOpen,
        handleEditTournament,
        handleDeleteTournament,
        handleOpenRemoveParticipantDialog,
        handleConfirmRemoveParticipant,
        handleCloseRemoveParticipantDialog,
        handleStartTournament,
        handleFinishTournament,
        matches,
        handleGenerateBracket,
        groupStandings,
        isUpdateScoreDialogOpen,
        selectedMatch,
        handleOpenUpdateScoreDialog,
        handleCloseUpdateScoreDialog,
        handleSubmitMatchScore,
        locations,
        isScheduleDialogOpen,
        matchToSchedule,
        handleOpenScheduleDialog,
        handleCloseScheduleDialog,
        handleScheduleMatch,
        handleGenerateKnockout,
    } = useAdminTournamentDetails(id);

    if (loading) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <NarrowPageWrapper>
                        <LoadingWrapper>
                            <CircularProgress />
                        </LoadingWrapper>
                    </NarrowPageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    if (!tournament) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <NarrowPageWrapper>
                        <NotFoundCard>
                            <NotFoundTitle>Tournament not found</NotFoundTitle>
                            <NotFoundText>
                                The tournament you are trying to manage does not exist.
                            </NotFoundText>
                        </NotFoundCard>
                    </NarrowPageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <AdminTournamentHeader
                        onBack={() => navigate("/admin")}
                        onEdit={() => setIsEditModalOpen(true)}
                        onDelete={() => setIsDeleteDialogOpen(true)}
                        extraActions={
                            <AdminTournamentStatusActions
                                tournament={tournament}
                                onStart={handleStartTournament}
                                onFinish={handleFinishTournament}
                            />
                        }
                    />

                    <AdminTournamentInfoCard tournament={tournament} />

                    <SectionsGrid>
                        <AdminTournamentParticipantsCard
                            participants={participants}
                            onRemoveParticipant={handleOpenRemoveParticipantDialog}
                        />

                        <AdminTournamentGroupsCard
                            groupStandings={groupStandings}
                            matches={matches}
                            tournament={tournament}
                            onGenerateBracket={handleGenerateBracket}
                            onGenerateKnockout={handleGenerateKnockout}
                            hasGeneratedBracket={matches.length > 0}
                            onUpdateScore={handleOpenUpdateScoreDialog}
                            onScheduleMatch={handleOpenScheduleDialog}
                        />
                    </SectionsGrid>
                </NarrowPageWrapper>

                <CreateTournamentModal
                    open={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleEditTournament}
                    initialData={initialEditData}
                    mode="edit"
                    locations={locations}
                />

                <DeleteTournamentDialog
                    open={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={() => handleDeleteTournament(() => navigate("/admin"))}
                />

                <RemoveParticipantDialog
                    open={Boolean(participantToRemove)}
                    participantName={participantToRemove?.fullName}
                    onClose={handleCloseRemoveParticipantDialog}
                    onConfirm={handleConfirmRemoveParticipant}
                />

                <UpdateMatchScoreDialog
                    open={isUpdateScoreDialogOpen}
                    match={selectedMatch}
                    onClose={handleCloseUpdateScoreDialog}
                    onSubmit={handleSubmitMatchScore}
                />

                <ScheduleMatchDialog
                    open={isScheduleDialogOpen}
                    match={matchToSchedule}
                    locations={locations}
                    onClose={handleCloseScheduleDialog}
                    onSubmit={handleScheduleMatch}
                />
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default AdminTournamentDetailsPage;

const SectionsGrid = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.lg}) {
        grid-template-columns: 1fr;
    }
`;