import { TextField } from "@mui/material";
import styled from "styled-components";

const AuthInput = styled(TextField)`
    .MuiOutlinedInput-root {
        border-radius: 0.65rem;
        background: white;

        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: #86efac;
        }

        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: #10b981;
            border-width: 2px;
        }
    }

    .MuiOutlinedInput-input {
        padding-top: 0.95rem;
        padding-bottom: 0.95rem;
    }

    .MuiInputLabel-root {
        font-weight: 500;
    }

    .MuiInputLabel-root.Mui-focused {
        color: #047857;
    }
`;

export default AuthInput;
