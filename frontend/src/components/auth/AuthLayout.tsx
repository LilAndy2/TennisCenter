import { Box } from "@mui/material";
import styled from "styled-components";

export const AuthPage = styled(Box)`
    min-height: 100vh;
    background: linear-gradient(180deg, #ecfdf5 0%, #f8fafc 70%);
    display: flex;
    flex-direction: column;
`;

export const AuthTopBar = styled(Box)`
  height: 4rem;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #d1fae5;
  backdrop-filter: blur(0.5rem);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
`;

export const AuthTopBarLeft = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const AuthTopBarRight = styled(Box)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const AuthContent = styled(Box)`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 62rem) {
    grid-template-columns: 1fr;
  }
`;

export const AuthRightSection = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
`;

export const AuthFormCardWrapper = styled(Box)`
  width: 100%;
  max-width: 28rem;
`;
