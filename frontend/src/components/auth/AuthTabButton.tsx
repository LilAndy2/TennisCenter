import { Button } from "@mui/material";
import styled from "styled-components";
import { colors, radius, shadow, transition } from "../../styles/theme";

const AuthTabButton = styled(Button)<{ $active: boolean }>`
    height: 2.5rem;
    border-radius: ${radius.sm} !important;
    text-transform: none !important;
    font-size: 0.95rem !important;
    font-weight: 700 !important;
    transition: all ${transition.normal} !important;

    background: ${({ $active }) => ($active ? colors.surface : "transparent")} !important;
    color: ${({ $active }) => ($active ? colors.primaryActive : colors.textMuted)} !important;
    border: ${({ $active }) => ($active ? `1px solid ${colors.borderGreenLight}` : "1px solid transparent")} !important;
    box-shadow: ${({ $active }) => ($active ? shadow.xs : "none")} !important;
`;

export default AuthTabButton;