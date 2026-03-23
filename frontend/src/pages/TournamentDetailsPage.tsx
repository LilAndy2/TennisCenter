import {
    ArrowBack,
    CalendarMonth,
    EmojiEventsOutlined,
    Group,
    LocationOn,
    SportsScore,
    SportsTennis,
} from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentLevelBadge from "../components/tournaments/TournamentLevelBadge";
import type { TournamentType, TournamentParticipantType } from "../types/tournament";
import { formatTournamentDateRange } from "../utils/formatTournamentDateRange";

function TournamentDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [tournament, setTournament] = useState<TournamentType | null>(null);
    const [loading, setLoading] = useState(true);
    const [participants, setParticipants] = useState<TournamentParticipantType[]>([]);
    const [registering, setRegistering] = useState(false);

    const loadParticipants = async () => {
        try {
            const response = await axiosInstance.get<TournamentParticipantType[]>(
                `/player/tournaments/${id}/participants`
            );
            setParticipants(response.data);
        } catch (error) {
            console.error("Failed to load participants", error);
        }
    };

    const handleRegister = async () => {
        if (!tournament) return;

        try {
            setRegistering(true);

            const response = await axiosInstance.post<TournamentType>(
                `/player/tournaments/${tournament.id}/register`
            );

            setTournament(response.data);
            await loadParticipants();
        } catch (error) {
            console.error("Failed to register to tournament", error);
        } finally {
            setRegistering(false);
        }
    };

    const handleWithdraw = async () => {
        if (!tournament) return;

        try {
            setRegistering(true);

            const response = await axiosInstance.delete<TournamentType>(
                `/player/tournaments/${tournament.id}/register`
            );

            setTournament(response.data);
            await loadParticipants();
        } catch (error) {
            console.error("Failed to withdraw from tournament", error);
        } finally {
            setRegistering(false);
        }
    };

    useEffect(() => {
        const loadTournament = async () => {
            try {
                const response = await axiosInstance.get<TournamentType>(`/player/tournaments/${id}`);
                setTournament(response.data);
            } catch (error) {
                console.error("Failed to load tournament", error);
                setTournament(null);
            } finally {
                setLoading(false);
            }
        };

        loadTournament();
        loadParticipants();
    }, [id]);

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
                    <BackButton onClick={() => navigate("/tournaments")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to tournaments</span>
                    </BackButton>

                    <NotFoundCard>
                        <NotFoundTitle>Tournament not found</NotFoundTitle>
                        <NotFoundText>
                            The tournament you are trying to access does not exist.
                        </NotFoundText>
                    </NotFoundCard>
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

                <HeroCard>
                    <TopBadgesRow>
                        <LeftBadges>
                            <TournamentLevelBadge level={tournament.level} />
                            <StatusBadge $status={tournament.status}>
                                {tournament.status}
                            </StatusBadge>
                            {tournament.status === "Upcoming" && tournament.isFull ? (
                                <FullBadge>Full</FullBadge>
                            ) : null}
                        </LeftBadges>
                    </TopBadgesRow>

                    <TournamentTitle>{tournament.name}</TournamentTitle>
                    <TournamentDescription>{tournament.description}</TournamentDescription>

                    <ActionRow>
                        {!tournament.currentUserAdmin ? (
                            tournament.registeredByCurrentUser ? (
                                <WithdrawButton onClick={handleWithdraw} disabled={registering}>
                                    {registering ? "Processing..." : "Withdraw"}
                                </WithdrawButton>
                            ) : tournament.registrationAllowedByLevel ? (
                                <RegisterButton
                                    onClick={handleRegister}
                                    disabled={!tournament.registrationOpen || registering}
                                >
                                    {tournament.isFull
                                        ? "Tournament full"
                                        : registering
                                            ? "Registering..."
                                            : "Register"}
                                </RegisterButton>
                            ) : null
                        ) : null}
                    </ActionRow>

                    <InfoGrid>
                        <InfoItem>
                            <InfoIconWrapper>
                                <CalendarMonth sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Tournament period</InfoLabel>
                                <InfoValue>
                                    {formatTournamentDateRange(
                                        tournament.startDate,
                                        tournament.endDate
                                    )}
                                </InfoValue>
                            </InfoTextBlock>
                        </InfoItem>

                        <InfoItem>
                            <InfoIconWrapper>
                                <Group sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Players</InfoLabel>
                                <InfoValue>
                                    Max {tournament.maxPlayers} accepted players
                                </InfoValue>
                            </InfoTextBlock>
                        </InfoItem>

                        <InfoItem>
                            <InfoIconWrapper>
                                <LocationOn sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Location</InfoLabel>
                                <InfoValue>{tournament.location}</InfoValue>
                            </InfoTextBlock>
                        </InfoItem>

                        <InfoItem>
                            <InfoIconWrapper>
                                <SportsTennis sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Surface</InfoLabel>
                                <InfoValue>{tournament.surface}</InfoValue>
                            </InfoTextBlock>
                        </InfoItem>

                        <InfoItem>
                            <InfoIconWrapper>
                                <EmojiEventsOutlined sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Bracket type</InfoLabel>
                                <InfoValue>{tournament.bracketType}</InfoValue>
                            </InfoTextBlock>
                        </InfoItem>

                        <InfoItem>
                            <InfoIconWrapper>
                                <SportsScore sx={{ fontSize: 20 }} />
                            </InfoIconWrapper>
                            <InfoTextBlock>
                                <InfoLabel>Tournament status</InfoLabel>
                                <InfoValue>{tournament.status}</InfoValue>
                            </InfoTextBlock>
                        </InfoItem>
                    </InfoGrid>
                </HeroCard>

                <BottomSectionsGrid>
                    <SectionCard>
                        <SectionTitle>Participants</SectionTitle>

                        {participants.length === 0 ? (
                            <SectionText>No players registered yet.</SectionText>
                        ) : (
                            <ParticipantsList>
                                {participants.map((participant) => (
                                    <ParticipantItem key={participant.id}>
                                        <ParticipantName>{participant.fullName}</ParticipantName>
                                        <ParticipantEmail>{participant.email}</ParticipantEmail>
                                    </ParticipantItem>
                                ))}
                            </ParticipantsList>
                        )}
                    </SectionCard>

                    <SectionCard>
                        <SectionTitle>Bracket</SectionTitle>
                        <SectionText>
                            This section will contain the tournament bracket and match progression.
                        </SectionText>
                    </SectionCard>

                    <SectionCard $fullWidth>
                        <SectionTitle>Matches & Scores</SectionTitle>
                        <SectionText>
                            This section will show scheduled matches, results, and score updates.
                        </SectionText>
                    </SectionCard>
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
    transition: 0.2s ease;

    &:hover {
        background: #e2e8f0;
    }
`;

const HeroCard = styled(Box)`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1.4rem;
    padding: 1.6rem;
    box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.05);
    margin-bottom: 1.2rem;
`;

const TopBadgesRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const LeftBadges = styled(Box)`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.55rem;
`;

const StatusBadge = styled(Typography)<{ $status: string }>`
    width: fit-content;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem !important;
    font-weight: 800 !important;
    background: ${({ $status }) => {
        switch ($status) {
            case "Upcoming":
                return "#eff6ff";
            case "Ongoing":
                return "#ecfdf5";
            case "Finished":
                return "#f1f5f9";
            default:
                return "#f8fafc";
        }
    }};
    color: ${({ $status }) => {
        switch ($status) {
            case "Upcoming":
                return "#1d4ed8";
            case "Ongoing":
                return "#059669";
            case "Finished":
                return "#64748b";
            default:
                return "#334155";
        }
    }};
`;

const FullBadge = styled(Typography)`
    width: fit-content;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    font-size: 0.78rem !important;
    font-weight: 800 !important;
    background: #fee2e2;
    color: #b91c1c;
`;

const TournamentTitle = styled(Typography)`
    font-size: 2rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 0.55rem !important;
`;

const TournamentDescription = styled(Typography)`
    font-size: 1rem !important;
    color: #64748b;
    line-height: 1.7 !important;
    margin-bottom: 1.3rem !important;
    max-width: 52rem;
`;

const InfoGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    @media (max-width: 56rem) {
        grid-template-columns: 1fr;
    }
`;

const InfoItem = styled(Box)`
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.95rem 1rem;
    border-radius: 1rem;
    background: #f8fafc;
`;

const InfoIconWrapper = styled(Box)`
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 0.8rem;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #475569;
    flex-shrink: 0;
`;

const InfoTextBlock = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
`;

const InfoLabel = styled(Typography)`
    font-size: 0.8rem !important;
    font-weight: 700 !important;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
`;

const InfoValue = styled(Typography)`
    font-size: 0.96rem !important;
    font-weight: 600 !important;
    color: #111827;
    line-height: 1.5 !important;
`;

const BottomSectionsGrid = styled(Box)`
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
    box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.04);
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

const ActionRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
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
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: #059669;
  }

  &:disabled {
    background: #cbd5e1;
    cursor: not-allowed;
  }
`;

const ParticipantsList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 10.5rem;
    overflow-y: auto;
    padding-right: 0.35rem;

    &::-webkit-scrollbar {
        width: 0.4rem;
    }

    &::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 999px;
    }
`;

const ParticipantItem = styled(Box)`
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
  transition: 0.2s ease;

  &:hover:not(:disabled) {
    background: #fecaca;
  }

  &:disabled {
    background: #cbd5e1;
    color: white;
    cursor: not-allowed;
  }
`;