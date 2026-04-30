import { Box, Typography } from "@mui/material";
import styled from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    shadow,
    transition,
} from "../../styles/theme";

export const SectionCard = styled(Box)`
    grid-column: 1 / -1;
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    box-shadow: ${shadow.sm};
    transition: box-shadow ${transition.normal};
`;

export const SectionTitle = styled(Typography)`
    font-size: ${fontSize.md} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    margin-bottom: ${spacing.sm} !important;
`;

export const SectionText = styled(Typography)`
    color: ${colors.textMuted};
    line-height: 1.65 !important;
`;

export const ControlsCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.md};
    margin-bottom: ${spacing.md};
    box-shadow: ${shadow.sm};
`;

export const ActionRow = styled(Box)`
    display: flex;
    gap: ${spacing.sm};
    margin-top: ${spacing.xs};
`;

export const GreenActionButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.primary};
    color: white;
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.primaryHover};
        box-shadow: ${shadow.green};
    }

    &:active {
        transform: scale(0.97);
    }
`;

export const DangerButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.dangerBg};
    color: ${colors.danger};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.dangerBgHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;

export const NeutralButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm};
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.surfaceAltHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;

export const NotFoundCard = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
`;

export const NotFoundTitle = styled(Typography)`
    font-size: 1.4rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    margin-bottom: 0.4rem !important;
`;

export const NotFoundText = styled(Typography)`
    color: ${colors.textMuted};
`;