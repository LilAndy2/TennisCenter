import { Box } from "@mui/material";
import type { ReactNode } from "react";
import styled from "styled-components";
import TopNavbar from "./TopNavbar";
import { colors, spacing, breakpoints, maxWidth, navbar } from "../../styles/theme";

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
    background: linear-gradient(180deg, ${colors.primaryLighter} 0%, ${colors.background} 40%);
`;

const PageContent = styled(Box)`
  padding: ${spacing.xl};
  max-width: ${maxWidth.full};
  width: 100%;
  margin: 0 auto;
  min-height: calc(100vh - ${navbar.height});

  @media (max-width: ${breakpoints.md}) {
    padding: ${spacing.md};
  }

  @media (max-width: ${breakpoints.sm}) {
    padding: ${spacing.sm};
  }
`;