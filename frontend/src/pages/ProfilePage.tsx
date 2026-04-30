import AuthenticatedLayout from "../components/layout/AuthenticatedLayout";
import { NarrowPageWrapper, PageTitle, PageSubtitle } from "../components/common/PageLayout";
import { SectionCard } from "../components/common/SectionCard";
import { AnimatedPage } from "../components/animated";

function ProfilePage() {
    return (
        <AnimatedPage>
            <AuthenticatedLayout>
                <NarrowPageWrapper>
                    <SectionCard>
                        <PageTitle>Profile</PageTitle>
                        <PageSubtitle>This page will contain the user profile.</PageSubtitle>
                    </SectionCard>
                </NarrowPageWrapper>
            </AuthenticatedLayout>
        </AnimatedPage>
    );
}

export default ProfilePage;