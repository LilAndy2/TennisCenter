import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";

function AboutUsPage() {
    return (
        <AuthenticatedLayout>
            <NarrowPageWrapper>
                <SectionCard>
                    <PageTitle>About Us</PageTitle>
                    <PageSubtitle>This page will contain the website description and purpose.</PageSubtitle>
                </SectionCard>
            </NarrowPageWrapper>
        </AuthenticatedLayout>
    );
}

export default AboutUsPage;