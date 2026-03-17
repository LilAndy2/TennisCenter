import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentCard from "../components/tournaments/TournamentCard";
import { mockTournaments, type TournamentStatus } from "../data/mockTournaments";

type FilterOption = TournamentStatus;

const filterOptions: FilterOption[] = ["Ongoing","Upcoming", "Finished"];

function TournamentsPage() {
    const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Ongoing");

    const filteredTournaments = useMemo(() => {
        return mockTournaments.filter(
            (tournament) => tournament.status === selectedFilter
        );
    }, [selectedFilter]);

    return (
        <AuthenticatedLayout>
            <PageWrapper>
                <PageHeader>
                    <PageTitle>Tournaments</PageTitle>
                    <PageSubtitle>
                        Explore available tournaments by level and filter them by current status.
                    </PageSubtitle>
                </PageHeader>

                <FiltersRow>
                    {filterOptions.map((option) => (
                        <FilterButton
                            key={option}
                            $active={selectedFilter === option}
                            onClick={() => setSelectedFilter(option)}
                        >
                            {option}
                        </FilterButton>
                    ))}
                </FiltersRow>

                <CardsGrid>
                    {filteredTournaments.map((tournament) => (
                        <TournamentCard key={tournament.id} tournament={tournament} />
                    ))}
                </CardsGrid>
            </PageWrapper>
        </AuthenticatedLayout>
    );
}

export default TournamentsPage;

const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
`;

const PageHeader = styled(Box)`
  margin-bottom: 1.2rem;
`;

const PageTitle = styled(Typography)`
    font-size: 2rem !important;
    font-weight: 800 !important;
    color: #111827;
    margin-bottom: 0.45rem !important;
`;

const PageSubtitle = styled(Typography)`
    color: #64748b;
    font-size: 0.98rem !important;
`;

const FiltersRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
`;

const FilterButton = styled.button<{ $active: boolean }>`
    height: 2.6rem;
    padding: 0 1rem;
    border: none;
    border-radius: 999px;
    background: ${({ $active }) => ($active ? "#10b981" : "#f1f5f9")};
    color: ${({ $active }) => ($active ? "white" : "#334155")};
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s ease;

    &:hover {
        background: ${({ $active }) => ($active ? "#059669" : "#e2e8f0")};
    }
`;

const CardsGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    @media (max-width: 64rem) {
        grid-template-columns: 1fr;
    }
`;