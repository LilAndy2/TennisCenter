import { Box } from "@mui/material";
import styled from "styled-components";
import { radius, shadow, transition, colors } from "../../styles/theme";

const GlassCard = styled(Box)<{ $variant?: "light" | "dark" | "green" }>`
    border-radius: ${radius.xl};
    padding: 1.5rem;
    transition: all ${transition.normal};
    will-change: transform;

    ${({ $variant = "light" }) => {
    switch ($variant) {
        case "dark":
            return `
                    background: rgba(15, 23, 42, 0.6);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: ${shadow.lg};
                    color: white;
                `;
        case "green":
            return `
                    background: rgba(16, 185, 129, 0.08);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid ${colors.borderGreenLight};
                    box-shadow: ${shadow.green};
                `;
        default: // light
            return `
                    background: rgba(255, 255, 255, 0.72);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: ${shadow.md};
                `;
    }
}}

    &:hover {
        transform: translateY(-2px);
        box-shadow: ${shadow.lg};
    }
`;

export default GlassCard;