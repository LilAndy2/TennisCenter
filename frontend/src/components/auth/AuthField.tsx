import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import { colors, fontSize, fontWeight } from "../../styles/theme";

export const FieldWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
`;

export const FieldLabel = styled(Typography)`
    font-size: ${fontSize.base} !important;
    font-weight: ${fontWeight.semibold} !important;
    color: ${colors.textPrimary};
`;