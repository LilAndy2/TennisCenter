import { Close, Search, SportsScore } from "@mui/icons-material";
import { Box, CircularProgress, Dialog, DialogContent, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../../../api/axiosInstance";
import {
    colors,
    spacing,
    fontSize,
    radius,
    transition,
} from "../../../styles/theme";

type Umpire = {
    id: number;
    fullName: string;
    username: string;
    email: string;
};

type AssignUmpireDialogProps = {
    open: boolean;
    matchId: number | null;
    currentUmpireId?: number | null;
    onClose: () => void;
    onAssign: (matchId: number, umpireId: number) => Promise<void>;
    onRemove: (matchId: number) => Promise<void>;
};

function AssignUmpireDialog({
                                open,
                                matchId,
                                currentUmpireId,
                                onClose,
                                onAssign,
                                onRemove,
                            }: AssignUmpireDialogProps) {
    const [umpires, setUmpires] = useState<Umpire[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!open) {
            setSearch("");
            return;
        }
        loadUmpires();
    }, [open]);

    const loadUmpires = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get<Umpire[]>("/admin/players/umpires", {
                params: { search: "" },
            });
            setUmpires(res.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const filtered = umpires.filter((u) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            u.fullName.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q)
        );
    });

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <ModalContent>
                <ModalHeader>
                    <ModalTitle>Assign Umpire</ModalTitle>
                    <IconButton onClick={onClose} size="small">
                        <Close sx={{ fontSize: 20 }} />
                    </IconButton>
                </ModalHeader>

                {currentUmpireId && matchId && (
                    <RemoveRow>
                        <RemoveText>An umpire is currently assigned.</RemoveText>
                        <RemoveButton
                            onClick={async () => {
                                await onRemove(matchId);
                                onClose();
                            }}
                        >
                            Remove umpire
                        </RemoveButton>
                    </RemoveRow>
                )}

                <SearchWrapper>
                    <Search sx={{ fontSize: 18, color: colors.textHint }} />
                    <SearchInput
                        autoFocus
                        placeholder="Search umpires..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </SearchWrapper>

                <UmpireList>
                    {loading ? (
                        <LoadingBox>
                            <CircularProgress size={24} />
                        </LoadingBox>
                    ) : filtered.length === 0 ? (
                        <EmptyText>No umpires found</EmptyText>
                    ) : (
                        filtered.map((umpire) => (
                            <UmpireRow
                                key={umpire.id}
                                $selected={umpire.id === currentUmpireId}
                            >
                                <UmpireInfo>
                                    <UmpireName>{umpire.fullName}</UmpireName>
                                    <UmpireMeta>@{umpire.username}</UmpireMeta>
                                </UmpireInfo>
                                {umpire.id === currentUmpireId ? (
                                    <CurrentBadge>Current</CurrentBadge>
                                ) : (
                                    <AssignButton
                                        onClick={async () => {
                                            if (matchId) {
                                                await onAssign(matchId, umpire.id);
                                                onClose();
                                            }
                                        }}
                                    >
                                        <SportsScore sx={{ fontSize: 14 }} />
                                        <span>Assign</span>
                                    </AssignButton>
                                )}
                            </UmpireRow>
                        ))
                    )}
                </UmpireList>
            </ModalContent>
        </StyledDialog>
    );
}

export default AssignUmpireDialog;

const StyledDialog = styled(Dialog)`
    .MuiPaper-root {
        border-radius: ${radius.xl};
    }
`;

const ModalContent = styled(DialogContent)`
    padding: ${spacing.lg} !important;
`;

const ModalHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
`;

const ModalTitle = styled(Typography)`
    font-size: 1.1rem !important;
    font-weight: 800 !important;
    color: ${colors.textPrimary};
`;

const RemoveRow = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.sm};
    margin-bottom: ${spacing.sm};
    border-radius: ${radius.md};
    background: #fef2f2;
    border: 1px solid #fecaca;
`;

const RemoveText = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: #b91c1c;
    font-weight: 600 !important;
`;

const RemoveButton = styled.button`
    height: 1.85rem;
    padding: 0 0.65rem;
    border: none;
    border-radius: ${radius.pill};
    background: #b91c1c;
    color: white;
    font-size: ${fontSize.xs};
    font-weight: 700;
    cursor: pointer;

    &:hover {
        background: #991b1b;
    }
`;

const SearchWrapper = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    height: 2.5rem;
    padding: 0 ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    background: ${colors.surfaceHover};
    margin-bottom: ${spacing.md};

    &:focus-within {
        border-color: ${colors.primary};
    }
`;

const SearchInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: ${fontSize.sm};
    color: ${colors.textPrimary};

    &::placeholder {
        color: ${colors.textHint};
    }
`;

const UmpireList = styled(Box)`
    max-height: 18rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

const LoadingBox = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.lg};
`;

const EmptyText = styled(Typography)`
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
    padding: ${spacing.lg} 0;
`;

const UmpireRow = styled(Box)<{ $selected: boolean }>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.sm} ${spacing.md};
    border-radius: ${radius.md};
    border: 1px solid ${({ $selected }) => ($selected ? colors.borderGreen : colors.border)};
    background: ${({ $selected }) => ($selected ? "#f0fdf4" : "white")};
    transition: border-color ${transition.fast};

    &:hover {
        border-color: ${colors.borderGreen};
    }
`;

const UmpireInfo = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.05rem;
`;

const UmpireName = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    font-weight: 700 !important;
    color: ${colors.textPrimary};
`;

const UmpireMeta = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
`;

const CurrentBadge = styled.span`
    font-size: ${fontSize.xs};
    font-weight: 700;
    color: ${colors.primary};
    padding: 0.15rem 0.5rem;
    border-radius: ${radius.pill};
    background: ${colors.primaryLighter};
`;

const AssignButton = styled.button`
    height: 1.85rem;
    padding: 0 0.6rem;
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.xs};
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;

    &:hover {
        background: ${colors.primaryHover};
    }
`;