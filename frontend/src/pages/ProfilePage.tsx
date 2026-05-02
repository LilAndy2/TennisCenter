import { Box, CircularProgress, Typography } from "@mui/material";
import { useState } from "react";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import ProfileInfoCard from "../components/profile/ProfileInfoCard";
import ProfileTabs, { type ProfileTab } from "../components/profile/ProfileTabs";
import MatchHistoryTable from "../components/profile/MatchHistoryTable";
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
} from "../styles/theme";

function ProfilePage() {
    const {
        profile,
        matchHistory,
        loading,
        uploadingImage,
        uploadProfileImage,
    } = usePlayerProfile();

    const [activeTab, setActiveTab] = useState<ProfileTab>("match-history");

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
                                    <MatchCount>
                                        {matchHistory.length} match{matchHistory.length !== 1 ? "es" : ""}
                                    </MatchCount>
                                </SectionHeader>
                                <MatchHistoryTable
                                    matches={matchHistory}
                                    profileUserId={profile.userId}
                                />
                            </SectionCard>
                        )}

                        {activeTab === "titles-finals" && (
                            <SectionCard>
                                <SectionTitle>Titles &amp; Finals</SectionTitle>
                                <PlaceholderText>
                                    Titles and finals tracking will be available soon.
                                </PlaceholderText>
                            </SectionCard>
                        )}

                        {activeTab === "stats" && (
                            <SectionCard>
                                <SectionTitle>Personalised Stats</SectionTitle>
                                <PlaceholderText>
                                    Detailed statistics and analytics will be available soon.
                                </PlaceholderText>
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

const MatchCount = styled(Typography)`
    font-size: ${fontSize.sm} !important;
    color: ${colors.textMuted};
    font-weight: ${fontWeight.medium} !important;
`;

const PlaceholderText = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.base} !important;
    padding: ${spacing.xl} 0;
    text-align: center;
`;