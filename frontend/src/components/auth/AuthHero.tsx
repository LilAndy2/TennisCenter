import { Box } from "@mui/material";
import styled from "styled-components";
import { radius } from "../../styles/theme";

export const HeroSection = styled(Box)<{ backgroundimage: string }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    min-height: calc(100vh - 4rem);
    background-image: linear-gradient(
            rgba(16, 185, 129, 0.80),
            rgba(5, 150, 105, 0.85)
    ),
    url(${({ backgroundimage }) => backgroundimage});
    background-size: cover;
    background-position: center;

    @media (max-width: 62rem) {
        min-height: 26rem;
    }
`;

export const HeroContent = styled(Box)`
    max-width: 34rem;
    text-align: center;
    color: white;
    position: relative;
    z-index: 2;
`;

export const HeroIconContainer = styled(Box)`
    width: 4rem;
    height: 4rem;
    border-radius: ${radius.lg};
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.12);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 2rem auto;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
`;