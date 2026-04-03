import { Close } from "@mui/icons-material";
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import type { Location } from "../../../types/location";
import type { TournamentMatch } from "../../../types/match";

type ScheduleMatchDialogProps = {
    open: boolean;
    match: TournamentMatch | null;
    locations: Location[];
    onClose: () => void;
    onSubmit: (matchId: number, scheduledTime: string, courtId: number) => Promise<void>;
};

function ScheduleMatchDialog({
                                 open,
                                 match,
                                 locations,
                                 onClose,
                                 onSubmit,
                             }: ScheduleMatchDialogProps) {
    const [selectedLocationId, setSelectedLocationId] = useState<number | "">("");
    const [selectedCourtId, setSelectedCourtId] = useState<number | "">("");
    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open && match) {
            setError("");
            if (match.scheduledTime) {
                const dt = new Date(match.scheduledTime);
                setScheduledDate(dt.toISOString().slice(0, 10));
                setScheduledTime(dt.toTimeString().slice(0, 5));
            } else {
                setScheduledDate("");
                setScheduledTime("");
            }
            if (match.courtId) {
                const loc = locations.find(l =>
                    l.courts.some(c => c.id === match.courtId)
                );
                setSelectedLocationId(loc?.id ?? "");
                setSelectedCourtId(match.courtId);
            } else {
                setSelectedLocationId("");
                setSelectedCourtId("");
            }
        }
    }, [open, match]);

    const selectedLocation = locations.find(l => l.id === selectedLocationId);

    const handleSubmit = async () => {
        if (!scheduledDate || !scheduledTime || selectedCourtId === "") {
            setError("Please fill in all fields.");
            return;
        }
        if (!match) return;
        try {
            const isoDateTime = `${scheduledDate}T${scheduledTime}:00`;
            await onSubmit(match.id, isoDateTime, Number(selectedCourtId));
            onClose();
        } catch {
            setError("Failed to schedule match. Please try again.");
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContentWrapper>
                <HeaderRow>
                    <HeaderTitle>Schedule match</HeaderTitle>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </HeaderRow>

                <MatchTitle>
                    {match?.playerOneName ?? "TBD"} vs {match?.playerTwoName ?? "TBD"}
                </MatchTitle>

                <FieldsWrapper>
                    <FieldGroup>
                        <FieldLabel>Date</FieldLabel>
                        <StyledInput
                            type="date"
                            value={scheduledDate}
                            onChange={e => setScheduledDate(e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Time</FieldLabel>
                        <StyledInput
                            type="time"
                            value={scheduledTime}
                            onChange={e => setScheduledTime(e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Location</FieldLabel>
                        <StyledSelect
                            value={selectedLocationId}
                            onChange={e => {
                                setSelectedLocationId(Number(e.target.value));
                                setSelectedCourtId("");
                            }}
                        >
                            <option value="">Select a location</option>
                            {locations.map(loc => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </StyledSelect>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Court</FieldLabel>
                        <StyledSelect
                            value={selectedCourtId}
                            onChange={e => setSelectedCourtId(Number(e.target.value))}
                            disabled={!selectedLocation}
                        >
                            <option value="">Select a court</option>
                            {selectedLocation?.courts.map(court => (
                                <option key={court.id} value={court.id}>
                                    Court {court.courtNumber}
                                </option>
                            ))}
                        </StyledSelect>
                    </FieldGroup>
                </FieldsWrapper>

                {error ? <ErrorText>{error}</ErrorText> : null}

                <BottomRow>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                    <SaveButton onClick={handleSubmit}>Save schedule</SaveButton>
                </BottomRow>
            </DialogContentWrapper>
        </StyledDialog>
    );
}

export default ScheduleMatchDialog;

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 1rem;
  }
`;

const DialogContentWrapper = styled(DialogContent)`
  padding: 1rem 1.1rem 1.1rem !important;
`;

const HeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const HeaderTitle = styled(Typography)`
  font-size: 1.05rem !important;
  font-weight: 800 !important;
`;

const MatchTitle = styled(Typography)`
  font-size: 0.94rem !important;
  font-weight: 700 !important;
  color: #111827;
  margin-bottom: 1rem !important;
`;

const FieldsWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FieldGroup = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const FieldLabel = styled(Typography)`
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: #475569;
`;

const StyledInput = styled.input`
  height: 2.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0 0.75rem;
  font-size: 0.9rem;
  outline: none;

  &:focus {
    border-color: #10b981;
  }
`;

const StyledSelect = styled.select`
  height: 2.6rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0 0.75rem;
  font-size: 0.9rem;
  outline: none;
  background: white;

  &:focus {
    border-color: #10b981;
  }

  &:disabled {
    background: #f1f5f9;
    color: #94a3b8;
  }
`;

const ErrorText = styled(Typography)`
  color: #dc2626;
  font-size: 0.84rem !important;
  margin-top: 0.5rem !important;
`;

const BottomRow = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  height: 2.4rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;

const SaveButton = styled.button`
  height: 2.4rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;