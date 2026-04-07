import { Close } from "@mui/icons-material";
import { Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import styled from "styled-components";
import type { Location } from "../../types/location";
import LocationSelector from "./LocationSelector";

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

type CreateTournamentModalProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTournamentFormData) => Promise<void>;
    initialData?: CreateTournamentFormData;
    mode?: "create" | "edit";
    locations: Location[];
};

const defaultForm: CreateTournamentFormData = {
    name: "",
    level: "ENTRY",
    bracketType: "SINGLE_ELIMINATION",
    surface: "CLAY",
    startDate: "",
    endDate: "",
    maxPlayers: "16",
    locationIds: [],
    description: "",
};

function CreateTournamentModal({
                                   open,
                                   onClose,
                                   onSubmit,
                                   initialData,
                                   mode = "create",
                                   locations,
                               }: CreateTournamentModalProps) {
    const [formData, setFormData] = useState<CreateTournamentFormData>(
        initialData ?? defaultForm
    );

    useEffect(() => {
        if (open) {
            setFormData(initialData ?? defaultForm);
        }
    }, [initialData, open]);

    const handleChange = (field: keyof CreateTournamentFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleToggleLocation = (id: number) => {
        setFormData((prev) => ({
            ...prev,
            locationIds: prev.locationIds.includes(id)
                ? prev.locationIds.filter((l) => l !== id)
                : [...prev.locationIds, id],
        }));
    };

    const handleSubmit = async () => {
        if (
            !formData.name.trim() ||
            !formData.startDate ||
            !formData.endDate ||
            !formData.maxPlayers.trim()
        )
            return;

        if (new Date(formData.endDate) < new Date(formData.startDate)) return;

        await onSubmit(formData);
        onClose();
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogContentWrapper>
                <HeaderRow>
                    <HeaderTitle>
                        {mode === "edit" ? "Edit tournament" : "Create tournament"}
                    </HeaderTitle>
                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </HeaderRow>

                <FormGrid>
                    <FieldGroup>
                        <FieldLabel>Name</FieldLabel>
                        <StyledInput
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Level</FieldLabel>
                        <StyledSelect
                            value={formData.level}
                            onChange={(e) => handleChange("level", e.target.value)}
                        >
                            <option value="ENTRY">Entry</option>
                            <option value="STARTER">Starter</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="MASTER">Master</option>
                            <option value="EXPERT">Expert</option>
                            <option value="STELLAR">Stellar</option>
                        </StyledSelect>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Start date</FieldLabel>
                        <StyledInput
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>End date</FieldLabel>
                        <StyledInput
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                        />
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Surface</FieldLabel>
                        <StyledSelect
                            value={formData.surface}
                            onChange={(e) => handleChange("surface", e.target.value)}
                        >
                            <option value="CLAY">Clay</option>
                            <option value="GRASS">Grass</option>
                            <option value="HARD">Hard</option>
                        </StyledSelect>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Max players</FieldLabel>
                        <StyledSelect
                            value={formData.maxPlayers}
                            onChange={(e) => handleChange("maxPlayers", e.target.value)}
                        >
                            <option value="4">4</option>
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="32">32</option>
                        </StyledSelect>
                    </FieldGroup>

                    <FieldGroup>
                        <FieldLabel>Bracket type</FieldLabel>
                        <StyledSelect
                            value={formData.bracketType}
                            onChange={(e) => handleChange("bracketType", e.target.value)}
                        >
                            <option value="SINGLE_ELIMINATION">Single elimination</option>
                            <option value="ROUND_ROBIN_THEN_KNOCKOUT">
                                Round robin + knockout
                            </option>
                        </StyledSelect>
                    </FieldGroup>
                </FormGrid>

                <FieldGroup>
                    <FieldLabel>Locations</FieldLabel>
                    <LocationSelector
                        locations={locations}
                        selectedIds={formData.locationIds}
                        onToggle={handleToggleLocation}
                    />
                </FieldGroup>

                <FieldGroup>
                    <FieldLabel>Description</FieldLabel>
                    <StyledTextArea
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                    />
                </FieldGroup>

                <BottomRow>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                    <SaveButton onClick={handleSubmit}>
                        {mode === "edit" ? "Save changes" : "Create"}
                    </SaveButton>
                </BottomRow>
            </DialogContentWrapper>
        </StyledDialog>
    );
}

export default CreateTournamentModal;

const StyledDialog = styled(Dialog)`
    .MuiPaper-root {
        border-radius: 1.25rem;
    }
`;

const DialogContentWrapper = styled(DialogContent)`
    padding: 1.25rem !important;
`;

const HeaderRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
`;

const HeaderTitle = styled(Typography)`
    font-size: 1.25rem !important;
    font-weight: 800 !important;
`;

const FormGrid = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const FieldGroup = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
`;

const FieldLabel = styled(Typography)`
    font-size: 0.9rem !important;
    font-weight: 700 !important;
`;

const StyledInput = styled.input`
    height: 2.8rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0 0.8rem;
    font-size: 0.95rem;
    outline: none;

    &:focus {
        border-color: #10b981;
    }
`;

const StyledSelect = styled.select`
    height: 2.8rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0 0.8rem;
    font-size: 0.95rem;
    outline: none;
    background: white;

    &:focus {
        border-color: #10b981;
    }
`;

const StyledTextArea = styled.textarea`
    min-height: 7rem;
    resize: none;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 0.8rem;
    font-size: 0.95rem;
    outline: none;

    &:focus {
        border-color: #10b981;
    }
`;

const BottomRow = styled(Box)`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
`;

const CancelButton = styled.button`
    height: 2.8rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: #f1f5f9;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #e2e8f0;
    }
`;

const SaveButton = styled.button`
    height: 2.8rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: #10b981;
    color: white;
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #059669;
    }
`;