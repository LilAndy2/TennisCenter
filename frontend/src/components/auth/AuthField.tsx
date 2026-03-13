import { Box, Typography } from "@mui/material";
import styled from "styled-components";

export const FieldWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
`;

export const FieldLabel = styled(Typography)`
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    color: #1f2937;
`;
