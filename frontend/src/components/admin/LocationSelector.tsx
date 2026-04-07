import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import type { Location } from "../../types/location";

type LocationSelectorProps = {
    locations: Location[];
    selectedIds: number[];
    onToggle: (id: number) => void;
};

function LocationSelector({ locations, selectedIds, onToggle }: LocationSelectorProps) {
    if (locations.length === 0) {
        return (
            <NoLocationsText>
                No locations available. Create one in the admin dashboard first.
            </NoLocationsText>
        );
    }

    return (
        <LocationCheckboxGrid>
            {locations.map((loc) => {
                const checked = selectedIds.includes(loc.id);
                return (
                    <LocationCheckboxItem
                        key={loc.id}
                        $checked={checked}
                        onClick={() => onToggle(loc.id)}
                    >
                        <CheckboxDot $checked={checked} />
                        <LocationCheckboxText>
                            <span style={{ fontWeight: 700 }}>{loc.name}</span>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                {loc.address}
                            </span>
                        </LocationCheckboxText>
                    </LocationCheckboxItem>
                );
            })}
        </LocationCheckboxGrid>
    );
}

export default LocationSelector;

const NoLocationsText = styled(Typography)`
  font-size: 0.88rem !important;
  color: #94a3b8;
  font-style: italic;
`;

const LocationCheckboxGrid = styled(Box)`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;

  @media (max-width: 40rem) {
    grid-template-columns: 1fr 1fr;
  }
`;

const LocationCheckboxItem = styled(Box)<{ $checked: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.75rem;
  border: 1.5px solid ${({ $checked }) => ($checked ? "#10b981" : "#e5e7eb")};
  background: ${({ $checked }) => ($checked ? "#f0fdf4" : "white")};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: #10b981;
  }
`;

const CheckboxDot = styled(Box)<{ $checked: boolean }>`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid ${({ $checked }) => ($checked ? "#10b981" : "#cbd5e1")};
  background: ${({ $checked }) => ($checked ? "#10b981" : "white")};
  flex-shrink: 0;
  margin-top: 0.15rem;
  transition: all 0.15s ease;
`;

const LocationCheckboxText = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  font-size: 0.88rem;
`;