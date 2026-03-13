import { TextField } from "@mui/material";
import styled from "styled-components";

const AuthInput = styled(TextField)`
    .MuiOutlinedInput-root {
        border-radius: 0.65rem;
        background: white;
    }

    .MuiOutlinedInput-input {
        padding-top: 0.95rem;
        padding-bottom: 0.95rem;
    }

    .MuiInputLabel-root {
        font-weight: 500;
    }
`;

export default AuthInput;
