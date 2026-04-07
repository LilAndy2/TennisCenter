import { ArrowBack } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentInfoCard from "../components/tournaments/TournamentInfoCard";
import AdminTournamentGroupsCard from "../components/admin/tournament-details/AdminTournamentGroupsCard";
import useTournamentDetails from "../hooks/useTournamentDetails";
import KnockoutBracketCard from "../components/admin/tournament-details/KnockoutBracketCard.tsx";

function TournamentDetailsPage() {
    const navigate = useNavigate();
    const {
        tournament,
        loading,
        participants,
        registering,
        groupStandings,
        matches,
        handleRegister,
        handleWithdraw,
    } = useTournamentDetails();

    if (loading) {
        return (
            <AuthenticatedLayout>
                <PageWrapper>
                    <LoadingWrapper><CircularProgress /></LoadingWrapper>
                </PageWrapper>
            </AuthenticatedLayout>
        );
    }

    if (!tournament) {
        return (
            <AuthenticatedLayout>
                <PageWrapper>
                    <BackButton onClick={() => navigate("/tournaments")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to tournaments</span>
                    </BackButton>
                    <NotFoundCard>
                        <NotFoundTitle>Tournament not found</NotFoundTitle>
                        <NotFoundText>The tournament you are trying to access does not exist.</NotFoundText>
                    </NotFoundCard>
                </PageWrapper>
            </AuthenticatedLayout>
        );
    }

    const actions = !tournament.currentUserAdmin ? (
        tournament.registeredByCurrentUser ? (
            <WithdrawButton onClick={handleWithdraw} disabled={registering}>
                {registering ? "Processing..." : "Withdraw"}
            </WithdrawButton>
        ) : tournament.registrationAllowedByLevel ? (
            <RegisterButton onClick={handleRegister} disabled={!tournament.registrationOpen || registering}>
                {tournament.isFull ? "Tournament full" : registering ? "Registering..." : "Register"}
            </RegisterButton>
        ) : null
    ) : null;

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <BackButton onClick={() => navigate("/tournaments")}>
                    <ArrowBack sx={{ fontSize: 18 }} />
                    <span>Back to tournaments</span>
                </BackButton>

                <TournamentInfoCard tournament={tournament} actions={actions} />

                <BottomSectionsGrid>
                    <SectionCard>
                        <SectionTitle>Participants</SectionTitle>
                        {participants.length === 0 ? (
                            <SectionText>No players registered yet.</SectionText>
                        ) : (
                            <ParticipantsList>
                                {participants.map(p => (
                                    <ParticipantItem key={p.id}>
                                        <ParticipantName>{p.fullName}</ParticipantName>
                                        <ParticipantEmail>{p.email}</ParticipantEmail>
                                    </ParticipantItem>
                                ))}
                            </ParticipantsList>
                        )}
                    </SectionCard>

                    <AdminTournamentGroupsCard
                        groupStandings={groupStandings}
                        matches={matches}
                        tournament={tournament}
                        hasGeneratedBracket={matches.length > 0}
                        readOnly
                    />

                    {tournament.bracketType === "Single Elimination" && (
                        <KnockoutBracketCard
                            matches={matches}
                            readOnly
                        />
                    )}
                </BottomSectionsGrid>
            </PageWrapper>
        </AuthenticatedLayout>
    );
}

export default TournamentDetailsPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 72rem;
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
  &:hover { background: #e2e8f0; }
`;
const BottomSectionsGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 64rem) { grid-template-columns: 1fr; }
`;
const SectionCard = styled(Box)`
  grid-column: 1 / -1;  
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
const RegisterButton = styled.button`
  height: 2.85rem;
  padding: 0 1.15rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) { background: #059669; }
  &:disabled { background: #cbd5e1; cursor: not-allowed; }
`;
const WithdrawButton = styled.button`
  height: 2.85rem;
  padding: 0 1.15rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  &:hover:not(:disabled) { background: #fecaca; }
  &:disabled { background: #cbd5e1; color: white; cursor: not-allowed; }
`;
const ParticipantsList = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  max-height: 12.5rem;
  overflow-y: auto;
  padding-right: 0.35rem;
  @media (max-width: 72rem) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 48rem) { grid-template-columns: 1fr; }
  &::-webkit-scrollbar { width: 0.4rem; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
`;
const ParticipantItem = styled(Box)`
  min-height: 5.2rem;
  padding: 0.85rem 1rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
`;
const ParticipantName = styled(Typography)`
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  color: #111827;
`;
const ParticipantEmail = styled(Typography)`
  font-size: 0.84rem !important;
  color: #64748b;
  margin-top: 0.15rem !important;
`;