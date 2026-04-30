import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";
import { AnimatedPage } from "../components/animated";

function AboutUsPage() {
    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <SectionCard>
                        <PageTitle>About Us</PageTitle>
                        <PageSubtitle>This page will contain the website description and purpose.</PageSubtitle>
                    </SectionCard>
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default AboutUsPage;