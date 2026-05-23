import { Box, CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import ProfileTabs, { type ProfileTab } from "../components/profile/ProfileTabs";
import MatchHistoryTable from "../components/profile/MatchHistoryTable";
import TitlesFinalsTable from "../components/profile/TitlesFinalsTable";
import usePlayerProfile from "../hooks/usePlayerProfile";
import { AnimatedPage } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageHeader,
    PageTitle,
    PageSubtitle,
    LoadingWrapper,
} from "../components/common/PageLayout";
import { SectionCard, SectionTitle, SectionText } from "../components/common/SectionCard";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
} from "../styles/theme";
import PlayerStatsSection from "../components/profile/PlayerStatsSection.tsx";

function ProfilePage() {
    const { userId: userIdParam } = useParams<{ userId: string }>();
    const parsedUserId = userIdParam ? Number(userIdParam) : undefined;

    const {
        profile,
        matchHistory,
        titlesAndFinals,
        loading,
        uploadingImage,
        uploadProfileImage,
        updateBio,
    } = usePlayerProfile(parsedUserId);

    const [activeTab, setActiveTab] = useState<ProfileTab>("match-history");
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    // Compute available years from match history (based on tournament start date)
    const availableYears = useMemo(() => {
        const years = [...new Set(matchHistory.map((m) => m.tournamentStartYear))];
        return years.sort((a, b) => b - a);
    }, [matchHistory]);

    // Filter matches by selected year
    const filteredMatches = useMemo(() => {
        if (selectedYear === null) return matchHistory;
        return matchHistory.filter((m) => m.tournamentStartYear === selectedYear);
    }, [matchHistory, selectedYear]);

    // Check if this is the current user's own profile
    const storedUser = localStorage.getItem("user");
    const currentUserId = storedUser ? JSON.parse(storedUser).id : null;
    const isOwnProfile = profile ? profile.userId === currentUserId : false;

    if (loading) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <PageWrapper>
                        <LoadingWrapper>
                            <CircularProgress />
                        </LoadingWrapper>
                    </PageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    if (!profile) {
        return (
            <AnimatedPage>
                <AuthenticatedLayout>
                    <PageWrapper>
                        <SectionCard>
                            <SectionTitle>Profile not found</SectionTitle>
                            <SectionText>
                                Unable to load profile data. Please try again later.
                            </SectionText>
                        </SectionCard>
                    </PageWrapper>
                </AuthenticatedLayout>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>Player Profile</PageTitle>
                        <PageSubtitle>
                            View match history, stats, and achievements
                        </PageSubtitle>
                    </PageHeader>

                    {/* Section 1: Basic Info */}
                    <ProfileInfoCard
                        profile={profile}
                        isOwnProfile={isOwnProfile}
                        uploadingImage={uploadingImage}
                        onUploadImage={uploadProfileImage}
                        onUpdateBio={updateBio}
                    />

                    {/* Section 2: Tabs Content */}
                    <ContentSection>
                        <ProfileTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                        />

                        {activeTab === "match-history" && (
                            <SectionCard>
                                <SectionHeader>
                                    <SectionTitle>Match History</SectionTitle>
                                    <YearSelect
                                        value={selectedYear ?? "all"}
                                        onChange={(e) =>
                                            setSelectedYear(
                                                e.target.value === "all"
                                                    ? null
                                                    : Number(e.target.value)
                                            )
                                        }
                                    >
                                        <option value="all">All years</option>
                                        {availableYears.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </YearSelect>
                                </SectionHeader>
                                <MatchHistoryTable
                                    matches={filteredMatches}
                                    profileUserId={profile.userId}
                                />
                            </SectionCard>
                        )}

                        {activeTab === "titles-finals" && (
                            <SectionCard>
                                <SectionTitle>Titles &amp; Finals</SectionTitle>
                                <TitlesFinalsTable entries={titlesAndFinals} />
                            </SectionCard>
                        )}

                        {activeTab === "stats" && (
                            <SectionCard>
                                <PlayerStatsSection userId={profile.userId} />
                            </SectionCard>
                        )}
                    </ContentSection>
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default ProfilePage;

/* ─── Styled Components ─── */

const PageWrapper = styled(BasePageWrapper)`
    max-width: 72rem;
`;

const ContentSection = styled(Box)`
    margin-top: ${spacing.lg};
`;

const SectionHeader = styled(Box)`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${spacing.md};
`;

const YearSelect = styled.select`
    height: 2.25rem;
    padding: 0 2rem 0 0.75rem;
    border: 1px solid ${colors.border};
    border-radius: ${radius.md};
    background: ${colors.surface};
    color: ${colors.textPrimary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.semibold};
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.6rem center;
    transition: border-color ${transition.fast};

    &:hover {
        border-color: ${colors.textHint};
    }

    &:focus {
        border-color: ${colors.primary};
    }
`;