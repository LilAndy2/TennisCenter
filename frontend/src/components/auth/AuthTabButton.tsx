import { Button } from "@mui/material";
import styled from "styled-components";

const AuthTabButton = styled(Button)<{ $active: boolean }>`
  height: 2.5rem;
  border-radius: 0.5rem !important;
  text-transform: none !important;
  font-size: 0.95rem !important;
  font-weight: 700 !important;
  box-shadow: none !important;

  background: ${({ $active }) => ($active ? "#ffffff" : "transparent")} !important;
  color: ${({ $active }) => ($active ? "#047857" : "#64748b")} !important;
  border: ${({ $active }) => ($active ? "1px solid #a7f3d0" : "1px solid transparent")} !important;
`;

export default AuthTabButton;
