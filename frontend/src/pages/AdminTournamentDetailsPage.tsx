import { Box, CircularProgress, Typography } from "@mui/material";
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
    } = useAdminTournamentDetails(id);

    if (loading) {
        return (
            <AuthenticatedLayout>
                <PageWrapper>
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                </PageWrapper>
            </AuthenticatedLayout>
        );
    }

    if (!tournament) {
        return (
            <AuthenticatedLayout>
                <PageWrapper>
                    <NotFoundCard>
                        <NotFoundTitle>Tournament not found</NotFoundTitle>
                        <NotFoundText>
                            The tournament you are trying to manage does not exist.
                        </NotFoundText>
                    </NotFoundCard>
                </PageWrapper>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <PageWrapper>
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
                        onGenerateBracket={handleGenerateBracket}
                        hasGeneratedBracket={matches.length > 0}
                        onUpdateScore={handleOpenUpdateScoreDialog}
                        onScheduleMatch={handleOpenScheduleDialog}
                    />
                </SectionsGrid>
            </PageWrapper>

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
    );
}

export default AdminTournamentDetailsPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
`;

const SectionsGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 64rem) {
    grid-template-columns: 1fr;
  }
`;

const NotFoundCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.25rem;
  padding: 1.5rem;
`;

const NotFoundTitle = styled(Typography)`
  font-size: 1.4rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.4rem !important;
`;

const NotFoundText = styled(Typography)`
  color: #64748b;
`;

const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;