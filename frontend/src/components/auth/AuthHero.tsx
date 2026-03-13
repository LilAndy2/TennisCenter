import { Box } from "@mui/material";
import styled from "styled-components";

export const HeroSection = styled(Box)<{ backgroundimage: string }>`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    min-height: calc(100vh - 4rem);
    background-image: linear-gradient(
            rgba(52, 211, 153, 0.82),
            rgba(16, 185, 129, 0.82)
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
`;

export const HeroIconContainer = styled(Box)`
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.35);
    background: rgba(255, 255, 255, 0.14);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 2rem auto;
    backdrop-filter: blur(0.25rem);
`;
