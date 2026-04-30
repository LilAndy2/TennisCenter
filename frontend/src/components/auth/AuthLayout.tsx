import { Box } from "@mui/material";
import styled from "styled-components";
import { colors, spacing, breakpoints } from "../../styles/theme";

export const AuthPage = styled(Box)`
    min-height: 100vh;
    background: linear-gradient(180deg, ${colors.primaryLighter} 0%, ${colors.background} 70%);
    display: flex;
    flex-direction: column;
`;

export const AuthTopBar = styled(Box)`
    height: 4rem;
    background: rgba(255, 255, 255, 0.9);
    border-bottom: 1px solid ${colors.borderGreen};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 ${spacing.xl};
`;

export const AuthTopBarLeft = styled(Box)`
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

export const AuthTopBarRight = styled(Box)`
    display: flex;
    align-items: center;
    gap: ${spacing.md};
`;

export const AuthContent = styled(Box)`
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;

    @media (max-width: ${breakpoints.lg}) {
        grid-template-columns: 1fr;
    }
`;

export const AuthRightSection = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${spacing.xl};
`;

export const AuthFormCardWrapper = styled(Box)`
    width: 100%;
    max-width: 28rem;
`;