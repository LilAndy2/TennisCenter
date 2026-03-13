import { Typography } from "@mui/material";
import styled from "styled-components";

export const BrandText = styled(Typography)`
    font-size: 1.7rem !important;
    font-weight: 800 !important;
    color: #10b981;
`;

export const BrandMutedText = styled(Typography)`
    font-size: 1.2rem !important;
    font-weight: 700 !important;
    color: #64748b;
`;

export const HeroTitle = styled(Typography)`
  font-size: 3.5rem !important;
  font-weight: 800 !important;
  line-height: 1.05 !important;
  margin-bottom: 1.5rem !important;

  @media (max-width: 62rem) {
    font-size: 2.5rem !important;
  }
`;

export const HeroDescription = styled(Typography)`
  font-size: 1.15rem !important;
  line-height: 1.7 !important;
  opacity: 0.95;
`;

export const FormTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 700 !important;
  color: #111827;
  text-align: center;
  margin-bottom: 0.5rem !important;
`;

export const FormSubtitle = styled(Typography)`
  text-align: center;
  color: #64748b;
  margin-bottom: 1.4rem !important;
`;

export const FooterText = styled(Typography)`
  text-align: center;
  color: #94a3b8;
  font-size: 0.9rem !important;
  margin-top: 1.2rem !important;
`;
