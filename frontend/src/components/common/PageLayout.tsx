import { Box, Typography } from "@mui/material";
import styled, { keyframes } from "styled-components";
import {
    colors,
    spacing,
    fontSize,
    fontWeight,
    radius,
    transition,
    maxWidth,
} from "../../styles/theme";

/* ─── Page Wrappers ─── */

export const PageWrapper = styled(Box)`
    width: 100%;
    max-width: ${maxWidth.wide};
    margin: 0 auto;
`;

export const NarrowPageWrapper = styled(Box)`
    width: 100%;
    max-width: ${maxWidth.content};
    margin: 0 auto;
`;

export const FeedPageWrapper = styled(Box)`
    width: 100%;
    max-width: ${maxWidth.narrow};
    margin: 0 auto;
`;

/* ─── Page Header ─── */

export const PageHeader = styled(Box)`
    margin-bottom: ${spacing.lg};
`;

export const PageTitle = styled(Typography)`
    font-size: ${fontSize["2xl"]} !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.textPrimary};
    margin-bottom: 0.35rem !important;
    letter-spacing: -0.02em;
`;

export const PageSubtitle = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.base} !important;
    line-height: 1.6 !important;
`;

/* ─── Loading ─── */

export const LoadingWrapper = styled(Box)`
    display: flex;
    justify-content: center;
    padding: ${spacing.xl} 0;
`;

/* ─── Skeleton Shimmer ─── */

const shimmer = keyframes`
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

export const Skeleton = styled(Box)<{
    $width?: string;
    $height?: string;
    $radius?: string;
}>`
    width: ${({ $width }) => $width ?? "100%"};
    height: ${({ $height }) => $height ?? "1rem"};
    border-radius: ${({ $radius }) => $radius ?? radius.md};
    background: linear-gradient(
        90deg,
        ${colors.surfaceAlt} 25%,
        ${colors.surfaceHover} 50%,
        ${colors.surfaceAlt} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease infinite;
`;

/* ─── Back Button ─── */

export const BackButton = styled.button`
    height: 2.75rem;
    padding: 0 ${spacing.md};
    border: none;
    border-radius: ${radius.pill};
    background: ${colors.surfaceAlt};
    color: ${colors.textSecondary};
    font-size: ${fontSize.sm} !important;
    font-weight: ${fontWeight.bold};
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    margin-bottom: ${spacing.md};
    transition: all ${transition.normal};

    &:hover {
        background: ${colors.surfaceAltHover};
    }

    &:active {
        transform: scale(0.97);
    }
`;

/* ─── Empty State ─── */

export const EmptyStateWrapper = styled(Box)`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: ${spacing.xxl} ${spacing.xl};
    gap: ${spacing.md};
`;

export const EmptyStateIcon = styled(Box)`
    width: 4rem;
    height: 4rem;
    border-radius: ${radius.lg};
    background: ${colors.primaryLighter};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${colors.primary};
`;

export const EmptyStateTitle = styled(Typography)`
    font-size: ${fontSize.lg} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
`;

export const EmptyStateText = styled(Typography)`
    color: ${colors.textMuted};
    font-size: ${fontSize.base} !important;
    max-width: 24rem;
`;