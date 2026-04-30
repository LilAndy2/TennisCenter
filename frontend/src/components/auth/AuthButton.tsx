import { Button } from "@mui/material";
import styled from "styled-components";
import { colors, radius, shadow, transition } from "../../styles/theme";

const AuthButton = styled(Button)`
    height: 3rem;
    border-radius: ${radius.sm} !important;
    text-transform: none !important;
    font-size: 1rem !important;
    font-weight: 700 !important;
    background: ${colors.primary} !important;
    color: white !important;
    box-shadow: ${shadow.green} !important;
    transition: all ${transition.normal} !important;

    &:hover {
        background: ${colors.primaryHover} !important;
        box-shadow: 0 0.7rem 1.6rem rgba(5, 150, 105, 0.22) !important;
    }

    &:active {
        transform: scale(0.98);
    }

    &:disabled {
        background: ${colors.surfaceAltHover} !important;
        color: ${colors.textHint} !important;
        box-shadow: none !important;
    }
`;

export default AuthButton;