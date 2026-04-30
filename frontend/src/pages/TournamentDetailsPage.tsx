import { ArrowBack } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentInfoCard from "../components/tournaments/TournamentInfoCard";
import AdminTournamentGroupsCard from "../components/admin/tournament-details/AdminTournamentGroupsCard";
import useTournamentDetails from "../hooks/useTournamentDetails";
import {
    NarrowPageWrapper,
    BackButton,
    LoadingWrapper,
} from "../components/common/PageLayout";
import {
    SectionCard,
    SectionTitle,
    SectionText,
    NotFoundCard,
    NotFoundTitle,
    NotFoundText,
} from "../components/common/SectionCard";
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
                <NarrowPageWrapper>
                    <LoadingWrapper><CircularProgress /></LoadingWrapper>
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        );
    }

    if (!tournament) {
        return (
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <BackButton onClick={() => navigate("/tournaments")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to tournaments</span>
                    </BackButton>
                    <NotFoundCard>
                        <NotFoundTitle>Tournament not found</NotFoundTitle>
                        <NotFoundText>The tournament you are trying to access does not exist.</NotFoundText>
                    </NotFoundCard>
                </NarrowPageWrapper>
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
            <NarrowPageWrapper>
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
                </BottomSectionsGrid>
            </NarrowPageWrapper>
        </AuthenticatedLayout>
    );
}

export default TournamentDetailsPage;

const BottomSectionsGrid = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.lg}) {
        grid-template-columns: 1fr;
    }
`;

const RegisterButton = styled.button`
    height: 2.85rem;
    padding: 0 ${spacing.lg};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.base};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover:not(:disabled) {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        background: #cbd5e1;
        cursor: not-allowed;
    }
`;

const WithdrawButton = styled.button`
    height: 2.85rem;
    padding: 0 ${spacing.lg};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.dangerBg};
    color: ${colors.danger};
    font-size: ${fontSize.base};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover:not(:disabled) {
        background: ${colors.dangerBgHover};
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        background: #cbd5e1;
        color: white;
        cursor: not-allowed;
    }
`;

const ParticipantsList = styled(Box)`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: ${spacing.sm};
    max-height: 12.5rem;
    overflow-y: auto;
    padding-right: 0.35rem;

    @media (max-width: 72rem) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: ${breakpoints.md}) {
        grid-template-columns: 1fr;
    }
`;

const ParticipantItem = styled(Box)`
    min-height: 5.2rem;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${radius.md};
    background: ${colors.surfaceHover};
    border: 1px solid ${colors.border};
    transition: border-color ${transition.normal};

    &:hover {
        border-color: ${colors.borderGreen};
    }
`;

const ParticipantName = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const ParticipantEmail = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    margin-top: 0.15rem !important;
`;