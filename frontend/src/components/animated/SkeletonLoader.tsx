import styled, { keyframes, css } from "styled-components";
import { Box } from "@mui/material";
import { colors, radius, spacing } from "../../styles/theme";

const shimmer = keyframes`
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
`;

const shimmerBg = css`
    background: linear-gradient(
        90deg,
        ${colors.surfaceAlt} 25%,
        ${colors.surfaceHover} 50%,
        ${colors.surfaceAlt} 75%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 1.5s ease infinite;
`;

export const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
    width: ${({ $width }) => $width ?? "100%"};
    height: ${({ $height }) => $height ?? "0.85rem"};
    border-radius: ${radius.sm};
    ${shimmerBg}
`;

export const SkeletonAvatar = styled.div<{ $size?: string }>`
    width: ${({ $size }) => $size ?? "2.5rem"};
    height: ${({ $size }) => $size ?? "2.5rem"};
    border-radius: 50%;
    flex-shrink: 0;
    ${shimmerBg}
`;

export const SkeletonBlock = styled.div<{ $height?: string }>`
    width: 100%;
    height: ${({ $height }) => $height ?? "8rem"};
    border-radius: ${radius.lg};
    ${shimmerBg}
`;

export function SkeletonCard() {
    return (
        <CardFrame>
            <SkeletonLine $width="5rem" $height="1.4rem" />
            <SkeletonLine $width="75%" $height="1.1rem" />
            <SkeletonLine $width="90%" />
            <SkeletonLine $width="60%" />
            <ChipsRow>
                <SkeletonLine $width="4.5rem" $height="1.6rem" />
                <SkeletonLine $width="5.5rem" $height="1.6rem" />
                <SkeletonLine $width="6rem" $height="1.6rem" />
            </ChipsRow>
        </CardFrame>
    );
}

/* Multiple skeletons for grid layouts */
export function SkeletonGroup({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </>
    );
}

/* Table row skeleton — mimics a leaderboard row */
export function SkeletonTableRow() {
    return (
        <TableRowFrame>
            <SkeletonLine $width="1.5rem" $height="1.5rem" />
            <SkeletonLine $width="40%" $height="0.9rem" />
            <SkeletonLine $width="2rem" $height="0.9rem" />
            <SkeletonLine $width="2rem" $height="0.9rem" />
            <SkeletonLine $width="2.5rem" $height="0.9rem" />
            <SkeletonLine $width="2.5rem" $height="0.9rem" />
        </TableRowFrame>
    );
}

export function SkeletonTable({ rows = 6 }: { rows?: number }) {
    return (
        <div>
            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonTableRow key={i} />
            ))}
        </div>
    );
}

const CardFrame = styled(Box)`
    background: ${colors.surface};
    border: 1px solid ${colors.border};
    border-radius: ${radius.xl};
    padding: ${spacing.lg};
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
`;

const ChipsRow = styled.div`
    display: flex;
    gap: ${spacing.xs};
    margin-top: 0.3rem;
`;

const TableRowFrame = styled.div`
    display: flex;
    align-items: center;
    gap: ${spacing.md};
    padding: ${spacing.sm} 0;
    border-bottom: 1px solid ${colors.border};
`;