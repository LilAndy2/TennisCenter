import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";

function SettingsPage() {
    return (
        <AuthenticatedLayout>
            <NarrowPageWrapper>
                <SectionCard>
                    <PageTitle>Settings</PageTitle>
                    <PageSubtitle>This page will contain settings.</PageSubtitle>
                </SectionCard>
            </NarrowPageWrapper>
        </AuthenticatedLayout>
    );
}

export default SettingsPage;