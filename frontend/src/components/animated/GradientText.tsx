import styled, { keyframes } from "styled-components";
import { colors } from "../../styles/theme";

const gradientShift = keyframes`
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
`;

const GradientText = styled.span<{ $speed?: string }>`
    background: linear-gradient(
        135deg,
        ${colors.primary},
        ${colors.primaryDark},
        #0ea5e9,
        ${colors.primary}
    );
    background-size: 300% 300%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: ${gradientShift} ${({ $speed }) => $speed ?? "6s"} ease infinite;
    display: inline-block;
`;

export default GradientText;