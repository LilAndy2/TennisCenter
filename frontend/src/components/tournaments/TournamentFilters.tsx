import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { TournamentLevel, TournamentSurface } from "../../types/tournament";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
    breakpoints,
} from "../../styles/theme";

export const ALL = "All" as const;

export type LevelFilter = TournamentLevel | typeof ALL;
export type SurfaceFilter = TournamentSurface | typeof ALL;

const levelOptions: TournamentLevel[] = [
    "Entry",
    "Starter",
    "Medium",
    "Master",
    "Expert",
    "Stellar",
];

const surfaceOptions: TournamentSurface[] = ["Clay", "Hard", "Grass"];

type TournamentFiltersProps = {
    level: LevelFilter;
    surface: SurfaceFilter;
    periodFrom: string;
    periodTo: string;
    onLevelChange: (value: LevelFilter) => void;
    onSurfaceChange: (value: SurfaceFilter) => void;
    onPeriodFromChange: (value: string) => void;
    onPeriodToChange: (value: string) => void;
    onReset: () => void;
};

function TournamentFilters({
                               level,
                               surface,
                               periodFrom,
                               periodTo,
                               onLevelChange,
                               onSurfaceChange,
                               onPeriodFromChange,
                               onPeriodToChange,
                               onReset,
                           }: TournamentFiltersProps) {
    const hasActiveFilters =
        level !== ALL || surface !== ALL || periodFrom !== "" || periodTo !== "";

    return (
        <FilterControlsCard>
            <FilterField>
                <FilterLabel>Level</FilterLabel>
                <StyledSelect
                    value={level}
                    onChange={(e) => onLevelChange(e.target.value as LevelFilter)}
                >
                    <option value={ALL}>All levels</option>
                    {levelOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </StyledSelect>
            </FilterField>

            <FilterField>
                <FilterLabel>Surface</FilterLabel>
                <StyledSelect
                    value={surface}
                    onChange={(e) => onSurfaceChange(e.target.value as SurfaceFilter)}
                >
                    <option value={ALL}>All surfaces</option>
                    {surfaceOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </StyledSelect>
            </FilterField>

            <FilterField>
                <FilterLabel>From</FilterLabel>
                <StyledDateInput
                    type="date"
                    value={periodFrom}
                    max={periodTo || undefined}
                    onChange={(e) => onPeriodFromChange(e.target.value)}
                />
            </FilterField>

            <FilterField>
                <FilterLabel>To</FilterLabel>
                <StyledDateInput
                    type="date"
                    value={periodTo}
                    min={periodFrom || undefined}
                    onChange={(e) => onPeriodToChange(e.target.value)}
                />
            </FilterField>

            {hasActiveFilters && (
                <ResetButton onClick={onReset}>Clear filters</ResetButton>
            )}
        </FilterControlsCard>
    );
}

export default TournamentFilters;

const FilterControlsCard = styled(Box)`
    display: flex;
    align-items: flex-end;
    flex-wrap: wrap;
    gap: ${spacing.md};
    padding: ${spacing.md};
    margin-bottom: ${spacing.lg};
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.lg};

    @media (max-width: ${breakpoints.sm}) {
        gap: ${spacing.sm};
    }
`;

const FilterField = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: ${spacing.xxs};
    min-width: 9.5rem;
    flex: 1 1 9.5rem;
`;

const FilterLabel = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textMuted};
    letter-spacing: 0.01em;
`;

const controlStyles = `
    height: 2.6rem;
    width: 100%;
    padding: 0 ${spacing.sm};
    border: 1px solid ${colors.border};
    border-radius: ${radius.sm};
    background: ${colors.surface};
    color: ${colors.textPrimary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.medium};
    cursor: pointer;
    transition: border-color ${transition.normal}, box-shadow ${transition.normal};

    &:hover {
        border-color: ${colors.borderGreen};
    }

    &:focus {
        outline: none;
        border-color: ${colors.primary};
        box-shadow: 0 0 0 3px ${colors.primaryLighter};
    }
`;

const StyledSelect = styled.select`
    ${controlStyles}
`;

const StyledDateInput = styled.input`
    ${controlStyles}
`;

const ResetButton = styled.button`
    height: 2.6rem;
    padding: 0 ${spacing.md};
    border: 1px solid ${colors.border};
    border-radius: ${radius.pill};
    background: ${colors.surface};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.surfaceAlt};
        color: ${colors.textPrimary};
    }

    &:active {
        transform: scale(0.97);
    }
`;