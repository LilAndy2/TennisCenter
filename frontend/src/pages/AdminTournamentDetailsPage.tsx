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
                />

                <AdminTournamentStatusActions
                    tournament={tournament}
                    onStart={handleStartTournament}
                    onFinish={handleFinishTournament}
                />

                <AdminTournamentInfoCard tournament={tournament} />

                <SectionsGrid>
                    <AdminTournamentParticipantsCard
                        participants={participants}
                        onRemoveParticipant={handleOpenRemoveParticipantDialog}
                    />

                    <SectionCard>
                        <SectionTitle>Bracket management</SectionTitle>
                        <SectionText>
                            This section will later contain bracket generation and tournament
                            structure controls.
                        </SectionText>
                    </SectionCard>

                    <SectionCard $fullWidth>
                        <SectionTitle>Matches & scores management</SectionTitle>
                        <SectionText>
                            This section will later allow the admin to manage matches, update
                            scores, and advance players.
                        </SectionText>
                    </SectionCard>
                </SectionsGrid>
            </PageWrapper>

            <CreateTournamentModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleEditTournament}
                initialData={initialEditData}
                mode="edit"
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

const SectionCard = styled(Box)<{ $fullWidth?: boolean }>`
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1.3rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

const SectionTitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.45rem !important;
`;

const SectionText = styled(Typography)`
  color: #64748b;
  line-height: 1.65 !important;
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