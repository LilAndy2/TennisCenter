import { Box, Typography } from "@mui/material";
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
} from "../../styles/theme";

type LocationCardProps = {
    location: Location;
    onEdit: (loc: Location) => void;
    onDelete: (id: number) => void;
};

function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
    return (
        <Card>
            <CardHeader>
                <LocationName>{location.name}</LocationName>
                <Actions>
                    <EditButton onClick={() => onEdit(location)}>Edit</EditButton>
                    <DeleteButton onClick={() => onDelete(location.id)}>Remove</DeleteButton>
                </Actions>
            </CardHeader>
            <Detail>{location.address}</Detail>
            {location.phone ? <Detail>{location.phone}</Detail> : null}
            {location.email ? <Detail>{location.email}</Detail> : null}
            <CourtsRow>
                {location.courts.map(court => (
                    <CourtChip key={court.id}>Court {court.courtNumber}</CourtChip>
                ))}
            </CourtsRow>
        </Card>
    );
}

export default LocationCard;

const Card = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.lg};
    padding: ${spacing.md};
    box-shadow: ${shadow.xs};
    transition: all ${transition.normal};

    &:hover {
        box-shadow: ${shadow.md};
        border-color: ${colors.borderGreen};
    }
`;

const CardHeader = styled(Box)`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${spacing.xs};
    margin-bottom: 0.4rem;
`;

const LocationName = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
`;

const Actions = styled(Box)`
    display: flex;
    gap: 0.4rem;
    flex-shrink: 0;
`;

const EditButton = styled.button`
    height: 1.9rem;
    padding: 0 0.7rem;
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.infoBg};
    color: ${colors.info};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.infoBgHover};
    }

    &:active {
        transform: scale(0.95);
    }
`;

const DeleteButton = styled.button`
    height: 1.9rem;
    padding: 0 0.7rem;
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.dangerBg};
    color: ${colors.danger};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.dangerBgHover};
    }

    &:active {
        transform: scale(0.95);
    }
`;

const Detail = styled(Typography)`
    font-size: ${fontSize.xs} !important;
    color: ${colors.textMuted};
    margin-top: 0.2rem !important;
`;

const CourtsRow = styled(Box)`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: ${spacing.sm};
`;

const CourtChip = styled(Box)`
    height: 1.8rem;
    padding: 0 0.65rem;
    border-radius: ${radius.pill};
    background: ${colors.primaryLighter};
    border: 1px solid ${colors.borderGreenLight};
    color: ${colors.primaryDark};
    font-size: ${fontSize.xs};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
`;