import { Button } from "@mui/material";
import styled from "styled-components";

const AuthButton = styled(Button)`
    height: 3rem;
    border-radius: 0.65rem !important;
    text-transform: none !important;
    font-size: 1rem !important;
    font-weight: 700 !important;
    background: #34d399 !important;
    color: white !important;
    box-shadow: none !important;

    &:hover {
        background: #10b981 !important;
        box-shadow: none !important;
    }
`;

export default AuthButton;
