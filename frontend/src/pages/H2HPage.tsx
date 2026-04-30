import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";
import { AnimatedPage } from "../components/animated";

function H2HPage() {
    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <SectionCard>
                        <PageTitle>H2H</PageTitle>
                        <PageSubtitle>This page will contain H2H.</PageSubtitle>
                    </SectionCard>
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default H2HPage;