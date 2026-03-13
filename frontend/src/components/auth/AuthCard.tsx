import { Box, Paper } from "@mui/material";
import styled from "styled-components";

export const AuthCard = styled(Paper)`
    padding: 2.2rem 1.6rem;
    border-radius: 1.25rem !important;
    box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.12) !important;
`;

export const AuthTabsRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.25rem;
    background: #eef2f7;
    border-radius: 0.65rem;
    padding: 0.25rem;
    margin-bottom: 1.4rem;
`;

export const AuthFieldsColumn = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const AuthRow = styled(Box)`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.9rem;

    @media (max-width: 40rem) {
        grid-template-columns: 1fr;
    }
`;

