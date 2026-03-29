import { Button } from "@mui/material";
import styled from "styled-components";

const AuthButton = styled(Button)`
    height: 3rem;
    border-radius: 0.65rem !important;
    text-transform: none !important;
    font-size: 1rem !important;
    font-weight: 700 !important;
    background: linear-gradient(135deg, #10b981, #059669) !important;
    color: white !important;
    box-shadow: 0 0.6rem 1.4rem rgba(5, 150, 105, 0.25) !important;

    &:hover {
        background: linear-gradient(135deg, #059669, #047857) !important;
        box-shadow: 0 0.7rem 1.6rem rgba(5, 150, 105, 0.28) !important;
    }
`;

export default AuthButton;
