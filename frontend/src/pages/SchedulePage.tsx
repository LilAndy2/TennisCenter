import { Paper, Typography } from "@mui/material";
import styled from "styled-components";
import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";

function SchedulePage() {
    return (
        <AuthenticatedLayout>
            <ContentCard>
                <PageTitle>Schedule</PageTitle>
                <PageDescription>This page will contain the schedule.</PageDescription>
            </ContentCard>
        </AuthenticatedLayout>
    );
}

export default SchedulePage;

const ContentCard = styled(Paper)`
  padding: 2rem;
  border-radius: 1.25rem !important;
  box-shadow: 0 0.75rem 2rem rgba(15, 23, 42, 0.06) !important;
`;

const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.5rem !important;
`;

const PageDescription = styled(Typography)`
  color: #64748b;
`;
