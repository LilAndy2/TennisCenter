import { Add } from "@mui/icons-material";
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";
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
    bracketType: string;
    surface: string;
    startDate: string;
    endDate: string;
    maxPlayers: string;
    locationIds: number[];
    description: string;
};

type LocationFormData = {
    name: string;
    address: string;
    phone: string;
    email: string;
};

const emptyLocationForm: LocationFormData = { name: "", address: "", phone: "", email: "" };

function AdminDashboardPage() {
    const [ongoingTournaments, setOngoingTournaments] = useState<TournamentType[]>([]);
    const [upcomingTournaments, setUpcomingTournaments] = useState<TournamentType[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<Location | null>(null);
    const [locationForm, setLocationForm] = useState<LocationFormData>(emptyLocationForm);

    const loadTournaments = async () => {
        try {
            const [ongoingRes, upcomingRes] = await Promise.all([
                axiosInstance.get<TournamentType[]>("/admin/tournaments/ongoing"),
                axiosInstance.get<TournamentType[]>("/admin/tournaments/upcoming"),
            ]);
            setOngoingTournaments(ongoingRes.data);
            setUpcomingTournaments(upcomingRes.data);
        } catch (error) {
            console.error("Failed to load tournaments", error);
        } finally {
            setLoading(false);
        }
    };

    const loadLocations = async () => {
        try {
            const res = await axiosInstance.get<Location[]>("/admin/locations");
            setLocations(res.data);
        } catch (error) {
            console.error("Failed to load locations", error);
        }
    };

    useEffect(() => {
        loadTournaments();
        loadLocations();
    }, []);

    const handleCreateTournament = async (data: CreateTournamentFormData) => {
        try {
            await axiosInstance.post("/admin/tournaments", {
                name: data.name,
                level: data.level,
                bracketType: data.bracketType,
                surface: data.surface,
                startDate: data.startDate,
                endDate: data.endDate,
                maxPlayers: Number(data.maxPlayers),
                locationIds: data.locationIds,
                description: data.description,
            });
            await loadTournaments();
        } catch (error) {
            console.error("Failed to create tournament", error);
            throw error;
        }
    };

    const openCreateLocation = () => {
        setEditingLocation(null);
        setLocationForm(emptyLocationForm);
        setIsLocationModalOpen(true);
    };

    const openEditLocation = (loc: Location) => {
        setEditingLocation(loc);
        setLocationForm({ name: loc.name, address: loc.address, phone: loc.phone ?? "", email: loc.email ?? "" });
        setIsLocationModalOpen(true);
    };

    const handleSaveLocation = async () => {
        if (!locationForm.name.trim() || !locationForm.address.trim()) return;
        try {
            if (editingLocation) {
                await axiosInstance.put(`/admin/locations/${editingLocation.id}`, locationForm);
            } else {
                await axiosInstance.post("/admin/locations", locationForm);
            }
            setIsLocationModalOpen(false);
            await loadLocations();
        } catch (error) {
            console.error("Failed to save location", error);
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
                    <ButtonsRow>
                        <CreateButton onClick={openCreateLocation}>
                            <Add sx={{ fontSize: 20 }} />
                            <span>Add location</span>
                        </CreateButton>
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
                            <HorizontalCardsRow>
                                {ongoingTournaments.map(t => (
                                    <HorizontalCardItem key={t.id}>
                                        <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Upcoming tournaments</SectionTitle>
                            <HorizontalCardsRow>
                                {upcomingTournaments.map(t => (
                                    <HorizontalCardItem key={t.id}>
                                        <TournamentCard tournament={t} detailsPath={`/admin/tournaments/${t.id}`} />
                                    </HorizontalCardItem>
                                ))}
                            </HorizontalCardsRow>
                        </SectionBlock>

                        <SectionBlock>
                            <SectionTitle>Locations</SectionTitle>
                            {locations.length === 0 ? (
                                <EmptyText>No locations added yet.</EmptyText>
                            ) : (
                                <LocationsGrid>
                                    {locations.map(loc => (
                                        <LocationCard key={loc.id}>
                                            <LocationCardHeader>
                                                <LocationName>{loc.name}</LocationName>
                                                <LocationActions>
                                                    <EditLocationButton onClick={() => openEditLocation(loc)}>
                                                        Edit
                                                    </EditLocationButton>
                                                    <DeleteLocationButton onClick={() => handleDeleteLocation(loc.id)}>
                                                        Remove
                                                    </DeleteLocationButton>
                                                </LocationActions>
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
                        </SectionBlock>
                    </SectionsWrapper>
                )}
            </PageWrapper>

            {/* Create/Edit Tournament Modal */}
            <CreateTournamentModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateTournament}
                locations={locations}
            />

            {/* Create/Edit Location Modal */}
            <StyledDialog open={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} maxWidth="sm" fullWidth>
                <LocDialogContent>
                    <LocHeaderRow>
                        <LocTitle>{editingLocation ? "Edit location" : "Add location"}</LocTitle>
                        <IconButton onClick={() => setIsLocationModalOpen(false)}>
                            <Close />
                        </IconButton>
                    </LocHeaderRow>

                    <LocFieldsGrid>
                        <LocFieldGroup>
                            <LocLabel>Name *</LocLabel>
                            <LocInput
                                placeholder="e.g. Tennis Club Central"
                                value={locationForm.name}
                                onChange={e => setLocationForm(p => ({ ...p, name: e.target.value }))}
                            />
                        </LocFieldGroup>
                        <LocFieldGroup>
                            <LocLabel>Address *</LocLabel>
                            <LocInput
                                placeholder="e.g. 12 Court Street"
                                value={locationForm.address}
                                onChange={e => setLocationForm(p => ({ ...p, address: e.target.value }))}
                            />
                        </LocFieldGroup>
                        <LocFieldGroup>
                            <LocLabel>Phone</LocLabel>
                            <LocInput
                                placeholder="+40 700 000 000"
                                value={locationForm.phone}
                                onChange={e => setLocationForm(p => ({ ...p, phone: e.target.value }))}
                            />
                        </LocFieldGroup>
                        <LocFieldGroup>
                            <LocLabel>Email</LocLabel>
                            <LocInput
                                placeholder="contact@venue.com"
                                value={locationForm.email}
                                onChange={e => setLocationForm(p => ({ ...p, email: e.target.value }))}
                            />
                        </LocFieldGroup>
                    </LocFieldsGrid>

                    {!editingLocation && (
                        <LocNote>5 courts will be automatically created for this location.</LocNote>
                    )}

                    <LocBottomRow>
                        <LocCancelButton onClick={() => setIsLocationModalOpen(false)}>Cancel</LocCancelButton>
                        <LocSaveButton onClick={handleSaveLocation}>
                            {editingLocation ? "Save changes" : "Add location"}
                        </LocSaveButton>
                    </LocBottomRow>
                </LocDialogContent>
            </StyledDialog>
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
const ButtonsRow = styled(Box)`
  display: flex;
  gap: 0.75rem;
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
  &:hover { background: #059669; }
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
const SectionTitle = styled(Typography)`
  font-size: 1.2rem !important;
  font-weight: 800 !important;
  color: #111827;
`;
const HorizontalCardsRow = styled(Box)`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-top: 0.35rem;
  border-radius: 1.25rem;
  &::-webkit-scrollbar { height: 0.45rem; }
  &::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
`;
const HorizontalCardItem = styled(Box)`
  flex: 0 0 calc(50% - 0.5rem);
  min-width: calc(50% - 0.5rem);
  @media (max-width: 72rem) { flex: 0 0 100%; min-width: 100%; }
`;
const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;
const EmptyText = styled(Typography)`
  color: #94a3b8;
  font-size: 0.94rem !important;
`;
const LocationsGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 72rem) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 48rem) { grid-template-columns: 1fr; }
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
`;
const LocationName = styled(Typography)`
  font-size: 0.98rem !important;
  font-weight: 800 !important;
  color: #111827;
`;
const LocationActions = styled(Box)`
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
`;
const EditLocationButton = styled.button`
  height: 1.9rem;
  padding: 0 0.7rem;
  border: none;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  &:hover { background: #dbeafe; }
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

const StyledDialog = styled(Dialog)`
  .MuiPaper-root { border-radius: 1.25rem; }
`;
const LocDialogContent = styled(DialogContent)`
  padding: 1.25rem !important;
`;
const LocHeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;
const LocTitle = styled(Typography)`
  font-size: 1.15rem !important;
  font-weight: 800 !important;
`;
const LocFieldsGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  @media (max-width: 40rem) { grid-template-columns: 1fr; }
`;
const LocFieldGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;
const LocLabel = styled(Typography)`
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: #475569;
`;
const LocInput = styled.input`
  height: 2.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0 0.75rem;
  font-size: 0.9rem;
  outline: none;
  &:focus { border-color: #10b981; }
`;
const LocNote = styled(Typography)`
  font-size: 0.82rem !important;
  color: #64748b;
  font-style: italic;
  margin-bottom: 1rem !important;
`;
const LocBottomRow = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
`;
const LocCancelButton = styled.button`
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
const LocSaveButton = styled.button`
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