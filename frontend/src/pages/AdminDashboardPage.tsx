import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import CreateTournamentModal from "../components/admin/CreateTournamentModal";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentCard from "../components/tournaments/TournamentCard";
import type { TournamentType } from "../types/tournament";
import type { Location } from "../types/location";

type CreateTournamentFormData = {
    name: string;
    level: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    location: string;
    description: string;
};

function AdminDashboardPage() {
    const [ongoingTournaments, setOngoingTournaments] = useState<TournamentType[]>([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isCreateLocationOpen, setIsCreateLocationOpen] = useState(false);
    const [newLocationName, setNewLocationName] = useState("");
    const [newLocationAddress, setNewLocationAddress] = useState("");
    const [newLocationPhone, setNewLocationPhone] = useState("");
    const [newLocationEmail, setNewLocationEmail] = useState("");

    const loadTournaments = async () => {
        try {
            const [ongoingResponse, upcomingResponse] = await Promise.all([
                axiosInstance.get<TournamentType[]>("/admin/tournaments/ongoing"),
                axiosInstance.get<TournamentType[]>("/admin/tournaments/upcoming"),
            ]);

            setOngoingTournaments(ongoingResponse.data);
            setUpcomingTournaments(upcomingResponse.data);
        } catch (error) {
            console.error("Failed to load admin tournaments", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLocations = async () => {
        try {
            const response = await axiosInstance.get<Location[]>("/admin/locations");
            setLocations(response.data);
        } catch (error) {
            console.error("Failed to load locations", error);
        }
    };

    useEffect(() => {
        loadTournaments();
        loadLocations()
    }, []);

    const handleCreateTournament = async (data: CreateTournamentFormData) => {
        try {
            await axiosInstance.post("/admin/tournaments", {
                name: data.name,
                level: data.level,
                surface: data.surface,
                startDate: data.startDate,
                endDate: data.endDate,
                maxPlayers: Number(data.maxPlayers),
                location: data.location,
                description: data.description,
            });

            await loadTournaments();
        } catch (error) {
            console.error("Failed to create tournament", error);
            throw error;
        }
    };

    const handleCreateLocation = async () => {
        if (!newLocationName.trim() || !newLocationAddress.trim()) return;
        try {
            await axiosInstance.post("/admin/locations", {
                name: newLocationName,
                address: newLocationAddress,
                phone: newLocationPhone,
                email: newLocationEmail,
            });
            setNewLocationName("");
            setNewLocationAddress("");
            setNewLocationPhone("");
            setNewLocationEmail("");
            setIsCreateLocationOpen(false);
            await loadLocations();
        } catch (error) {
            console.error("Failed to create location", error);
        }
    };

    const handleDeleteLocation = async (id: number) => {
        try {
            await axiosInstance.delete(`/admin/locations/${id}`);
            await loadLocations();
        } catch (error) {
            console.error("Failed to delete location", error);
        }
    };

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <TopRow>
                    <PageTitle>Admin dashboard</PageTitle>

                    <CreateButton onClick={() => setIsCreateModalOpen(true)}>
                        <Add sx={{ fontSize: 20 }} />
                        <span>Create tournament</span>
                    </CreateButton>
                </TopRow>

                {loading ? (
                    <LoadingWrapper>
                        <CircularProgress />
                    </LoadingWrapper>
                ) : (
                    <SectionsWrapper>
                        <SectionBlock>
                            <SectionTitle>Ongoing tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {ongoingTournaments.map((tournament) => (
                                    <HorizontalCardItem key={tournament.id}>
                                        <TournamentCard
                                            tournament={tournament}
                                            detailsPath={`/admin/tournaments/${tournament.id}`}
                                        />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Upcoming tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {upcomingTournaments.map((tournament) => (
                                    <HorizontalCardItem key={tournament.id}>
                                        <TournamentCard
                                            tournament={tournament}
                                            detailsPath={`/admin/tournaments/${tournament.id}`}
                                        />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionHeaderRow>
                                <SectionTitle>Locations</SectionTitle>
                                <AddLocationButton onClick={() => setIsCreateLocationOpen(true)}>
                                    + Add location
                                </AddLocationButton>
                            </SectionHeaderRow>

                            {locations.length === 0 ? (
                                <EmptyLocationsText>No locations added yet.</EmptyLocationsText>
                            ) : (
                                <LocationsGrid>
                                    {locations.map(loc => (
                                        <LocationCard key={loc.id}>
                                            <LocationCardHeader>
                                                <LocationName>{loc.name}</LocationName>
                                                <DeleteLocationButton onClick={() => handleDeleteLocation(loc.id)}>
                                                    Remove
                                                </DeleteLocationButton>
                                            </LocationCardHeader>
                                            <LocationDetail>{loc.address}</LocationDetail>
                                            {loc.phone ? <LocationDetail>{loc.phone}</LocationDetail> : null}
                                            {loc.email ? <LocationDetail>{loc.email}</LocationDetail> : null}
                                            <CourtsRow>
                                                {loc.courts.map(court => (
                                                    <CourtChip key={court.id}>Court {court.courtNumber}</CourtChip>
                                                ))}
                                            </CourtsRow>
                                        </LocationCard>
                                    ))}
                                </LocationsGrid>
                            )}

                            {isCreateLocationOpen ? (
                                <CreateLocationInline>
                                    <InlineTitle>New location</InlineTitle>
                                    <InlineFieldsGrid>
                                        <InlineInput
                                            placeholder="Name *"
                                            value={newLocationName}
                                            onChange={e => setNewLocationName(e.target.value)}
                                        />
                                        <InlineInput
                                            placeholder="Address *"
                                            value={newLocationAddress}
                                            onChange={e => setNewLocationAddress(e.target.value)}
                                        />
                                        <InlineInput
                                            placeholder="Phone"
                                            value={newLocationPhone}
                                            onChange={e => setNewLocationPhone(e.target.value)}
                                        />
                                        <InlineInput
                                            placeholder="Email"
                                            value={newLocationEmail}
                                            onChange={e => setNewLocationEmail(e.target.value)}
                                        />
                                    </InlineFieldsGrid>
                                    <InlineActions>
                                        <CancelInlineButton onClick={() => setIsCreateLocationOpen(false)}>
                                            Cancel
                                        </CancelInlineButton>
                                        <SaveInlineButton onClick={handleCreateLocation}>
                                            Save location
                                        </SaveInlineButton>
                                    </InlineActions>
                                </CreateLocationInline>
                            ) : null}
                        </SectionBlock>
                    </SectionsWrapper>
                )}
            </PageWrapper>

            <CreateTournamentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTournament}
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

const HorizontalCardsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 0.35rem;
  border-radius: 1.25rem;

  &::-webkit-scrollbar {
    height: 0.45rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }
`;

const HorizontalCardItem = styled(Box)`
  flex: 0 0 calc(50% - 0.5rem);
  min-width: calc(50% - 0.5rem);

  @media (max-width: 72rem) {
    flex: 0 0 100%;
    min-width: 100%;
  }
`;

const SectionTitle = styled(Typography)`
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: #111827;
`;

const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

const SectionHeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const AddLocationButton = styled.button`
  height: 2.4rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;

  &:hover { background: #059669; }
`;

const EmptyLocationsText = styled(Typography)`
  color: #64748b;
  font-size: 0.94rem !important;
`;

const LocationsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 72rem) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
  }
`;

const LocationCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
`;

const LocationCardHeader = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
`;

const LocationName = styled(Typography)`
  font-size: 0.98rem !important;
  font-weight: 800 !important;
  color: #111827;
`;

const DeleteLocationButton = styled.button`
  height: 1.9rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;

  &:hover { background: #fecaca; }
`;

const LocationDetail = styled(Typography)`
  font-size: 0.84rem !important;
  color: #64748b;
  margin-top: 0.2rem !important;
`;

const CourtsRow = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.75rem;
`;

const CourtChip = styled(Box)`
  height: 1.8rem;
  padding: 0 0.65rem;
  border-radius: 999px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #065f46;
  font-size: 0.78rem;
  font-weight: 700;
  display: flex;
  align-items: center;
`;

const CreateLocationInline = styled(Box)`
  margin-top: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem;
`;

const InlineTitle = styled(Typography)`
  font-size: 0.95rem !important;
  font-weight: 800 !important;
  margin-bottom: 0.75rem !important;
`;

const InlineFieldsGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.75rem;

  @media (max-width: 48rem) {
    grid-template-columns: 1fr;
  }
`;

const InlineInput = styled.input`
  height: 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0 0.75rem;
  font-size: 0.9rem;
  outline: none;

  &:focus { border-color: #10b981; }
`;

const InlineActions = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
`;

const CancelInlineButton = styled.button`
  height: 2.4rem;
  padding: 0 0.9rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;

const SaveInlineButton = styled.button`
  height: 2.4rem;
  padding: 0 0.9rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover { background: #059669; }
`;