import { Box } from "@mui/material";
import type { ReactNode } from "react";
import styled from "styled-components";
import TopNavbar from "./TopNavbar";

type AuthenticatedLayoutProps = {
    children: ReactNode;
};

function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
    return (
        <LayoutWrapper>
            <TopNavbar />
            <PageContent>{children}</PageContent>
        </LayoutWrapper>
    );
}

export default AuthenticatedLayout;

const LayoutWrapper = styled(Box)`
  min-height: 100vh;
  background: #f8fafc;
`;

const PageContent = styled(Box)`
  padding: 2rem;
`;
