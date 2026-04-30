import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import axiosInstance from "../api/axiosInstance";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import TournamentCard from "../components/tournaments/TournamentCard";
import { AnimatedPage } from "../components/animated";
import { AnimatedCard } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageHeader,
    PageTitle,
    PageSubtitle,
    LoadingWrapper,
} from "../components/common/PageLayout";
import type { TournamentStatus, TournamentType } from "../types/tournament";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
    breakpoints,
} from "../styles/theme";

type FilterOption = TournamentStatus;

const filterOptions: FilterOption[] = ["Ongoing", "Upcoming", "Finished"];

function TournamentsPage() {
    const [selectedFilter, setSelectedFilter] = useState<FilterOption>("Ongoing");
    const [tournaments, setTournaments] = useState<TournamentType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadTournaments = async () => {
            try {
                const response = await axiosInstance.get<TournamentType[]>("/player/tournaments");
                setTournaments(response.data);
            } catch (error) {
                console.error("Failed to load tournaments", error);
            } finally {
                setLoading(false);
            }
        };

        loadTournaments();
    }, []);

    const filteredTournaments = useMemo(() => {
        return tournaments.filter(
            (tournament) => tournament.status === selectedFilter
        );
    }, [selectedFilter, tournaments]);

    return (
        <AnimatedPage>
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

                    {loading ? (
                        <LoadingWrapper>
                            <CircularProgress />
                        </LoadingWrapper>
                    ) : filteredTournaments.length === 0 ? (
                        <EmptyText>
                            No {selectedFilter.toLowerCase()} tournaments found.
                        </EmptyText>
                    ) : (
                        <CardsGrid>
                            {filteredTournaments.map((tournament, index) => (
                                <AnimatedCard key={tournament.id} index={index}>
                                    <TournamentCard tournament={tournament} />
                                </AnimatedCard>
                            ))}
                        </CardsGrid>
                    )}
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default TournamentsPage;

const PageWrapper = styled(BasePageWrapper)`
    max-width: 72rem;
`;

const FiltersRow = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.xs};
    flex-wrap: wrap;
    margin-bottom: ${spacing.lg};
`;

const FilterButton = styled.button<{ $active: boolean }>`
    height: 2.6rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${({ $active }) => ($active ? colors.primary : colors.surfaceAlt)};
    color: ${({ $active }) => ($active ? "white" : colors.textSecondary)};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${({ $active }) => ($active ? colors.primaryHover : colors.surfaceAltHover)};
    }

    &:active {
        transform: scale(0.97);
    }
`;

const CardsGrid = styled(Box)`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${spacing.md};

    @media (max-width: ${breakpoints.lg}) {
        grid-template-columns: 1fr;
    }
`;

const EmptyText = styled(Typography)`
    color: ${colors.textHint};
    font-size: ${fontSize.base} !important;
    text-align: center;
    padding: ${spacing.xl} 0;
`;