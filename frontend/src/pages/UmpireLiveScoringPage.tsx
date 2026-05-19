import { SportsScore } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { AnimatedPage } from "../components/animated";
import {
    PageWrapper as BasePageWrapper,
    PageTitle,
    PageSubtitle,
    PageHeader,
} from "../components/common/PageLayout";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
} from "../styles/theme";

function UmpireLiveScoringPage() {
    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <PageWrapper>
                    <PageHeader>
                        <PageTitle>Live Scoring</PageTitle>
                        <PageSubtitle>
                            Update match scores in real time as an umpire.
                        </PageSubtitle>
                    </PageHeader>

                    <PlaceholderCard>
                        <SportsScore sx={{ fontSize: 48, color: colors.primary }} />
                        <PlaceholderTitle>Live Scoring Coming Soon</PlaceholderTitle>
                        <PlaceholderText>
                            This page will allow umpires to select an ongoing match and update
                            the score live, point by point. Stay tuned!
                        </PlaceholderText>
                    </PlaceholderCard>
                </PageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default UmpireLiveScoringPage;

const PageWrapper = styled(BasePageWrapper)`
    max-width: 48rem;
`;

const PlaceholderCard = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${spacing.md};
    padding: ${spacing.xl} ${spacing.lg};
    background: ${colors.surface};
    border-radius: ${radius.xl};
    border: 1px solid ${colors.borderGreen};
    box-shadow: ${shadow.sm};
    text-align: center;
`;

const PlaceholderTitle = styled(Typography)`
    font-size: ${fontSize.xl} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

const PlaceholderText = styled(Typography)`
    font-size: ${fontSize.base} !important;
    color: ${colors.textSecondary};
    max-width: 28rem;
    line-height: 1.6 !important;
`;