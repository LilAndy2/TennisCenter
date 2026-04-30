import { Box, Paper } from "@mui/material";
import styled from "styled-components";
import { colors, spacing, radius, shadow } from "../../styles/theme";

export const AuthCard = styled(Paper)`
    padding: 2.2rem 1.6rem;
    border-radius: ${radius.xl} !important;
    border: 1px solid ${colors.borderGreen};
    box-shadow: ${shadow.green} !important;
`;

export const AuthTabsRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    background: ${colors.primaryLighter};
    border-radius: ${radius.sm};
    padding: 0.25rem;
    margin-bottom: 1.4rem;
`;

export const AuthFieldsColumn = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${spacing.md};
`;

export const AuthRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;

    @media (max-width: 40rem) {
        grid-template-columns: 1fr;
    }
`;