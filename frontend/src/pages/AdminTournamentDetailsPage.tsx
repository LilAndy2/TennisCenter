import {
    ArrowBack,
    CalendarMonth,
    DeleteOutline,
    EditOutlined,
    EmojiEventsOutlined,
    Group,
    LocationOn,
    SportsScore,
    SportsTennis,
} from "@mui/icons-material";
import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentLevelBadge from "../components/tournaments/TournamentLevelBadge";
import type { TournamentType, TournamentParticipantType } from "../types/tournament";
import { formatTournamentDate } from "../utils/formatTournamentDate";
import { formatTournamentDateRange } from "../utils/formatTournamentDateRange";

type TournamentFormData = {
    name: string;
    level: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    location: string;
    description: string;
};

function AdminTournamentDetailsPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [tournament, setTournament] = useState<TournamentType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [participants, setParticipants] = useState<TournamentParticipantType[]>([])
    const [participantToRemove, setParticipantToRemove] = useState<TournamentParticipantType | null>(null);

    const loadTournament = async () => {
        try {
            const response = await axiosInstance.get<TournamentType>(
                `/player/tournaments/${id}`
            );
            setTournament(response.data);
        } catch (error) {
            console.error("Failed to load admin tournament details", error);
            setTournament(null);
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        loadTournament();
        loadParticipants();
    }, [id]);

    const initialEditData = useMemo<TournamentFormData | undefined>(() => {
        if (!tournament) return undefined;

        return {
            name: tournament.name,
            level: tournament.level.toUpperCase(),
            surface: tournament.surface.toUpperCase(),
            startDate: tournament.startDate,
            endDate: tournament.endDate,
            maxPlayers: String(tournament.maxPlayers),
            location: tournament.location,
            description: tournament.description,
        };
    }, [tournament]);

    const handleEditTournament = async (data: TournamentFormData) => {
        try {
            const response = await axiosInstance.put<TournamentType>(
                `/admin/tournaments/${id}`,
                {
                    name: data.name,
                    level: data.level,
                    surface: data.surface,
                    startDate: data.startDate,
                    endDate: data.endDate,
                    maxPlayers: Number(data.maxPlayers),
                    location: data.location,
                    description: data.description,
                }
            );

            setTournament(response.data);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update tournament", error);
            throw error;
        }
    };

    const handleDeleteTournament = async () => {
        try {
            await axiosInstance.delete(`/admin/tournaments/${id}`);
            setIsDeleteDialogOpen(false);
            navigate("/admin");
        } catch (error) {
            console.error("Failed to delete tournament", error);
        }
    };

    const handleOpenRemoveParticipantDialog = (
        participant: TournamentParticipantType
    ) => {
        setParticipantToRemove(participant);
    }

    const handleConfirmRemoveParticipant = async () => {
        if (!participantToRemove) return;

        try {
            await axiosInstance.delete(
                `/admin/tournaments/${id}/participants/${participantToRemove.id}`
            );

            await loadParticipants();
            await loadTournament();
            setParticipantToRemove(null);
        } catch (error) {
            console.error("Failed to remove participant", error);
        }
    };

    const handleCloseRemoveParticipantDialog = () => {
        setParticipantToRemove(null);
    }

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
                    <BackButton onClick={() => navigate("/admin")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to admin dashboard</span>
                    </BackButton>

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
                <TopBar>
                    <BackButton onClick={() => navigate("/admin")}>
                        <ArrowBack sx={{ fontSize: 18 }} />
                        <span>Back to admin dashboard</span>
                    </BackButton>

                    <TopBarActions>
                        <SecondaryActionButton onClick={() => setIsEditModalOpen(true)}>
                            <EditOutlined sx={{ fontSize: 18 }} />
                            <span>Edit tournament</span>
                        </SecondaryActionButton>

                        <DangerActionButton onClick={() => setIsDeleteDialogOpen(true)}>
                            <DeleteOutline sx={{ fontSize: 18 }} />
                            <span>Delete tournament</span>
                        </DangerActionButton>
                    </TopBarActions>
                </TopBar>

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
                                <InfoValue>Max {tournament.maxPlayers} accepted players</InfoValue>
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
                                <InfoLabel>Start date</InfoLabel>
                                <InfoValue>{formatTournamentDate(tournament.startDate)}</InfoValue>
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

                <SectionsGrid>
                    <SectionCard>
                        <SectionTitle>Registered players</SectionTitle>

                        {participants.length === 0 ? (
                            <SectionText>No players registered yet.</SectionText>
                        ) : (
                            <ParticipantsList>
                                {participants.map((participant) => (
                                    <ParticipantItem key={participant.id}>
                                        <ParticipantLeftColumn>
                                            <ParticipantName>{participant.fullName}</ParticipantName>
                                            <ParticipantEmail>{participant.email}</ParticipantEmail>
                                        </ParticipantLeftColumn>

                                        <ParticipantRightColumn>
                                            <ParticipantDate>
                                                Registered on {new Date(participant.registeredAt).toLocaleDateString()}
                                            </ParticipantDate>

                                            <RemoveParticipantButton
                                                onClick={() => handleOpenRemoveParticipantDialog(participant)}
                                            >
                                                Remove
                                            </RemoveParticipantButton>
                                        </ParticipantRightColumn>
                                    </ParticipantItem>
                                ))}
                            </ParticipantsList>
                        )}
                    </SectionCard>

                    <SectionCard>
                        <SectionTitle>Bracket management</SectionTitle>
                        <SectionText>
                            This section will later contain bracket generation and tournament structure controls.
                        </SectionText>
                    </SectionCard>

                    <SectionCard $fullWidth>
                        <SectionTitle>Matches & scores management</SectionTitle>
                        <SectionText>
                            This section will later allow the admin to manage matches, update scores, and advance players.
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

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete tournament</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to permanently delete this tournament?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <DialogButton onClick={() => setIsDeleteDialogOpen(false)}>
                        Cancel
                    </DialogButton>
                    <DeleteConfirmButton onClick={handleDeleteTournament}>
                        Delete
                    </DeleteConfirmButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(participantToRemove)}
                onClose={handleCloseRemoveParticipantDialog}
            >
                <DialogTitle>Remove participant</DialogTitle>

                <DialogContent>
                    <Typography>
                        Are you sure you want to remove{" "}
                        <strong>{participantToRemove?.fullName}</strong> from this tournament?
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <DialogButton onClick={handleCloseRemoveParticipantDialog}>
                        Cancel
                    </DialogButton>

                    <DeleteConfirmButton onClick={handleConfirmRemoveParticipant}>
                        Remove
                    </DeleteConfirmButton>
                </DialogActions>
            </Dialog>
        </AuthenticatedLayout>
    );
}

export default AdminTournamentDetailsPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
`;

const TopBar = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 64rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TopBarActions = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
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
    transition: 0.2s ease;

    &:hover {
        background: #e2e8f0;
    }
`;

const SecondaryActionButton = styled.button`
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

    &:hover {
        background: #059669;
    }
`;

const DangerActionButton = styled.button`
    height: 2.8rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: #fee2e2;
    color: #b91c1c;
    font-size: 0.92rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.45rem;
    cursor: pointer;

    &:hover {
        background: #fecaca;
    }
`;

const HeroCard = styled(Box)`
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 1.4rem;
    padding: 1.6rem;
    box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.035);
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

const DialogButton = styled.button`
    height: 2.6rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: #f1f5f9;
    color: #334155;
    font-weight: 700;
    cursor: pointer;
`;

const DeleteConfirmButton = styled.button`
    height: 2.6rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: #dc2626;
    color: white;
    font-weight: 700;
    cursor: pointer;
`;

const ParticipantsList = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    max-height: 11rem;
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  background: #f8fafc;
  border: 1px solid #e5e7eb;

  @media (max-width: 40rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ParticipantLeftColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.3rem;
  min-width: 0;
`;

const ParticipantRightColumn = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
  flex-shrink: 0;

  @media (max-width: 40rem) {
    align-items: flex-start;
  }
`;

const ParticipantName = styled(Typography)`
  font-size: 0.96rem !important;
  font-weight: 700 !important;
  color: #111827;
`;

const ParticipantEmail = styled(Typography)`
  font-size: 0.86rem !important;
  color: #475569;
`;

const ParticipantDate = styled(Typography)`
  font-size: 0.8rem !important;
  color: #64748b;
  text-align: right;

  @media (max-width: 40rem) {
    text-align: left;
  }
`;

const RemoveParticipantButton = styled.button`
  width: fit-content;
  height: 2.2rem;
  padding: 0 0.9rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #fecaca;
  }
`;