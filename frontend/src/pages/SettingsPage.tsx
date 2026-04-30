import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";
import { AnimatedPage } from "../components/animated";

function SettingsPage() {
    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <SectionCard>
                        <PageTitle>Settings</PageTitle>
                        <PageSubtitle>This page will contain settings.</PageSubtitle>
                    </SectionCard>
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default SettingsPage;