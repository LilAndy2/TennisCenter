import { TextField } from "@mui/material";
import styled from "styled-components";
import { colors, radius, transition } from "../../styles/theme";

const AuthInput = styled(TextField)`
    .MuiOutlinedInput-root {
        border-radius: ${radius.sm};
        background: white;
        transition: box-shadow ${transition.normal};

        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: ${colors.borderGreenLight};
        }

        &.Mui-focused {
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: ${colors.primary};
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
        color: ${colors.primaryActive};
    }
`;

export default AuthInput;