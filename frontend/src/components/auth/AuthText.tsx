import { Typography } from "@mui/material";
import styled from "styled-components";
import { colors, fontSize, fontWeight } from "../../styles/theme";

export const BrandText = styled(Typography)`
    font-size: 1.7rem !important;
    font-weight: ${fontWeight.black} !important;
    color: ${colors.primary};
`;

export const BrandMutedText = styled(Typography)`
    font-size: 1.2rem !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textMuted};
`;

export const HeroTitle = styled(Typography)`
    font-size: 3.5rem !important;
    font-weight: ${fontWeight.black} !important;
    line-height: 1.05 !important;
    margin-bottom: 1.5rem !important;
    letter-spacing: -0.03em;

    @media (max-width: 62rem) {
        font-size: 2.5rem !important;
    }
`;

export const HeroDescription = styled(Typography)`
    font-size: 1.15rem !important;
    line-height: 1.7 !important;
    opacity: 0.95;
`;

export const FormTitle = styled(Typography)`
    font-size: ${fontSize["2xl"]} !important;
    font-weight: ${fontWeight.bold} !important;
    color: ${colors.textPrimary};
    text-align: center;
    margin-bottom: 0.5rem !important;
    letter-spacing: -0.02em;
`;

export const FormSubtitle = styled(Typography)`
    text-align: center;
    color: ${colors.textMuted};
    margin-bottom: 1.4rem !important;
`;

export const FooterText = styled(Typography)`
    text-align: center;
    color: ${colors.textHint};
    font-size: ${fontSize.sm} !important;
    margin-top: 1.2rem !important;
`;