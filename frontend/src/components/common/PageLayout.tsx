import { Box, Typography } from "@mui/material";
import styled from "styled-components";

export const PageWrapper = styled(Box)`
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
`;

export const NarrowPageWrapper = styled(Box)`
  width: 100%;
  max-width: 72rem;
  margin: 0 auto;
`;

export const PageHeader = styled(Box)`
  margin-bottom: 1.25rem;
`;

export const PageTitle = styled(Typography)`
  font-size: 2rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.35rem !important;
`;

export const PageSubtitle = styled(Typography)`
  color: #64748b;
  font-size: 0.98rem !important;
  line-height: 1.6 !important;
`;

export const LoadingWrapper = styled(Box)`
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

export const BackButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;