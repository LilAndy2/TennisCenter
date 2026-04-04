import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { Location } from "../../types/location";

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
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.05);
`;
const CardHeader = styled(Box)`
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
const Actions = styled(Box)`
  display: flex;
  gap: 0.4rem;
  flex-shrink: 0;
`;
const EditButton = styled.button`
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
const DeleteButton = styled.button`
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
const Detail = styled(Typography)`
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