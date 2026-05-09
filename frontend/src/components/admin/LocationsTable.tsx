import { Add, DeleteOutline, EditOutlined, Search } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import styled from "styled-components";
import type { Location } from "../../types/location";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
    breakpoints,
} from "../../styles/theme";

type LocationsTableProps = {
    locations: Location[];
    onAdd: () => void;
    onEdit: (loc: Location) => void;
    onDelete: (loc: Location) => void;
};

const PAGE_SIZE = 5;

function LocationsTable({ locations, onAdd, onEdit, onDelete }: LocationsTableProps) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);

    // Filter locations by search
    const filtered = useMemo(() => {
        if (!search.trim()) return locations;
        const q = search.toLowerCase();
        return locations.filter(
            (loc) =>
                loc.name.toLowerCase().includes(q) ||
                loc.address.toLowerCase().includes(q) ||
                (loc.phone && loc.phone.toLowerCase().includes(q)) ||
                (loc.email && loc.email.toLowerCase().includes(q))
        );
    }, [locations, search]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    // Reset page when search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(0);
    };

    return (
        <TableWrapper>
            <TableHeader>
                <SectionTitle>Locations</SectionTitle>
                <HeaderActions>
                    <SearchWrapper>
                        <Search sx={{ fontSize: 18, color: colors.textHint }} />
                        <SearchInput
                            placeholder="Search locations..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                        />
                    </SearchWrapper>
                    <AddButton onClick={onAdd}>
                        <Add sx={{ fontSize: 18 }} />
                        <span>Add location</span>
                    </AddButton>
                </HeaderActions>
            </TableHeader>

            <TableContainer>
                <StyledTable>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Courts</th>
                        <th style={{ width: "7rem", textAlign: "center" }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {paginated.length === 0 ? (
                        <tr>
                            <EmptyCell colSpan={6}>
                                {search.trim()
                                    ? "No locations match your search."
                                    : "No locations added yet."}
                            </EmptyCell>
                        </tr>
                    ) : (
                        paginated.map((loc) => (
                            <tr key={loc.id}>
                                <td>
                                    <LocationName>{loc.name}</LocationName>
                                </td>
                                <td>{loc.address}</td>
                                <td>{loc.phone ?? "—"}</td>
                                <td>{loc.email ?? "—"}</td>
                                <td>
                                    <CourtsCell>
                                        {loc.courts.length} court{loc.courts.length !== 1 ? "s" : ""}
                                    </CourtsCell>
                                </td>
                                <td>
                                    <ActionsCell>
                                        <ActionButton
                                            $variant="edit"
                                            onClick={() => onEdit(loc)}
                                            title="Edit location"
                                        >
                                            <EditOutlined sx={{ fontSize: 16 }} />
                                        </ActionButton>
                                        <ActionButton
                                            $variant="delete"
                                            onClick={() => onDelete(loc)}
                                            title="Delete location"
                                        >
                                            <DeleteOutline sx={{ fontSize: 16 }} />
                                        </ActionButton>
                                    </ActionsCell>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </StyledTable>
            </TableContainer>

            {totalPages > 1 && (
                <PaginationRow>
                    <PaginationButton
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        Previous
                    </PaginationButton>

                    <PaginationInfo>
                        Page {page + 1} of {totalPages}
                    </PaginationInfo>

                    <PaginationButton
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page >= totalPages - 1}
                    >
                        Next
                    </PaginationButton>
                </PaginationRow>
            )}
        </TableWrapper>
    );
}

export default LocationsTable;

/* ─── Styled Components ─── */

const TableWrapper = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    box-shadow: ${shadow.sm};
    overflow: hidden;
`;

const TableHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${spacing.lg};
    gap: ${spacing.md};
    border-bottom: 1px solid ${colors.border};

    @media (max-width: ${breakpoints.md}) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const SectionTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    white-space: nowrap;
`;

const HeaderActions = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.sm};

    @media (max-width: ${breakpoints.sm}) {
        flex-direction: column;
        align-items: stretch;
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
    transition: border-color ${transition.normal};
    min-width: 14rem;

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

const AddButton = styled.button`
    height: 2.5rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    transition: all ${transition.normal};
    white-space: nowrap;

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const TableContainer = styled(Box)`
    overflow-x: auto;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;

    th,
    td {
        text-align: left;
        padding: ${spacing.sm} ${spacing.md};
        border-bottom: 1px solid ${colors.border};
        font-size: ${fontSize.sm};
    }

    th {
        color: ${colors.textSecondary};
        font-weight: ${fontWeight.black};
        font-size: ${fontSize.xs};
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: ${colors.surfaceHover};
    }

    td {
        color: ${colors.textPrimary};
        font-weight: ${fontWeight.medium};
    }

    tbody tr {
        transition: background ${transition.fast};
    }

    tbody tr:hover {
        background: ${colors.surfaceHover};
    }

    tbody tr:last-child td {
        border-bottom: none;
    }
`;

const LocationName = styled.span`
    font-weight: ${fontWeight.bold};
    color: ${colors.textPrimary};
`;

const CourtsCell = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 0.2rem 0.6rem;
    border-radius: ${radius.pill};
    background: ${colors.primaryLighter};
    color: ${colors.primaryDark};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
`;

const ActionsCell = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
`;

const ActionButton = styled.button<{ $variant: "edit" | "delete" }>`
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: ${radius.sm};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all ${transition.fast};
    background: ${({ $variant }) =>
    $variant === "edit" ? colors.infoBg : colors.dangerBg};
    color: ${({ $variant }) =>
    $variant === "edit" ? colors.info : colors.danger};

    &:hover {
        background: ${({ $variant }) =>
    $variant === "edit" ? colors.infoBgHover : colors.dangerBgHover};
    }

    &:active {
        transform: scale(0.92);
    }
`;

const EmptyCell = styled.td`
    text-align: center !important;
    color: ${colors.textMuted} !important;
    padding: ${spacing.xl} ${spacing.md} !important;
`;

const PaginationRow = styled(Box)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${spacing.sm} ${spacing.lg};
    border-top: 1px solid ${colors.border};
`;

const PaginationInfo = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.sm} !important;
`;

const PaginationButton = styled.button`
    height: 2.25rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover:not(:disabled) {
        background: ${colors.surfaceAltHover};
    }

    &:active:not(:disabled) {
        transform: scale(0.97);
    }

    &:disabled {
        color: ${colors.textHint};
        cursor: not-allowed;
        opacity: 0.6;
    }
`;