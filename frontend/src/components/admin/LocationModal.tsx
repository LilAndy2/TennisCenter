import { Close } from "@mui/icons-material";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import styled from "styled-components";
import type { Location } from "../../types/location";
import type { LocationFormData } from "../../types/forms";

type LocationModalProps = {
    open: boolean;
    editingLocation: Location | null;
    locationForm: LocationFormData;
    onClose: () => void;
    onSave: () => void;
    onChange: (updated: LocationFormData) => void;
};

function LocationModal({
                           open,
                           editingLocation,
                           locationForm,
                           onClose,
                           onSave,
                           onChange,
                       }: LocationModalProps) {
    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <LocDialogContent>
                <LocHeaderRow>
                    <LocTitle>{editingLocation ? "Edit location" : "Add location"}</LocTitle>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </LocHeaderRow>

                <LocFieldsGrid>
                    <LocFieldGroup>
                        <LocLabel>Name *</LocLabel>
                        <LocInput
                            placeholder="e.g. Tennis Club Central"
                            value={locationForm.name}
                            onChange={e => onChange({ ...locationForm, name: e.target.value })}
                        />
                    </LocFieldGroup>
                    <LocFieldGroup>
                        <LocLabel>Address *</LocLabel>
                        <LocInput
                            placeholder="e.g. 12 Court Street"
                            value={locationForm.address}
                            onChange={e => onChange({ ...locationForm, address: e.target.value })}
                        />
                    </LocFieldGroup>
                    <LocFieldGroup>
                        <LocLabel>Phone</LocLabel>
                        <LocInput
                            placeholder="+40 700 000 000"
                            value={locationForm.phone}
                            onChange={e => onChange({ ...locationForm, phone: e.target.value })}
                        />
                    </LocFieldGroup>
                    <LocFieldGroup>
                        <LocLabel>Email</LocLabel>
                        <LocInput
                            placeholder="contact@venue.com"
                            value={locationForm.email}
                            onChange={e => onChange({ ...locationForm, email: e.target.value })}
                        />
                    </LocFieldGroup>
                </LocFieldsGrid>

                {!editingLocation && (
                    <LocNote>5 courts will be automatically created for this location.</LocNote>
                )}

                <LocBottomRow>
                    <LocCancelButton onClick={onClose}>Cancel</LocCancelButton>
                    <LocSaveButton onClick={onSave}>
                        {editingLocation ? "Save changes" : "Add location"}
                    </LocSaveButton>
                </LocBottomRow>
            </LocDialogContent>
        </StyledDialog>
    );
}

export default LocationModal;

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