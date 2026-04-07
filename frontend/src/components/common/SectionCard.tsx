import { Box, Typography } from "@mui/material";
import styled from "styled-components";

export const SectionCard = styled(Box)`
  grid-column: 1 / -1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1.3rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

export const SectionTitle = styled(Typography)`
  font-size: 1.1rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.75rem !important;
`;

export const SectionText = styled(Typography)`
  color: #64748b;
  line-height: 1.65 !important;
`;

export const ControlsCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.2rem;
  padding: 1.1rem;
  margin-bottom: 1rem;
  box-shadow: 0 0.45rem 1.2rem rgba(15, 23, 42, 0.03);
`;

export const ActionRow = styled(Box)`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

export const GreenActionButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #059669;
  }
`;

export const DangerButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #fee2e2;
  color: #b91c1c;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #fecaca;
  }
`;

export const NeutralButton = styled.button`
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
  transition: 0.2s ease;

  &:hover {
    background: #e2e8f0;
  }
`;

export const NotFoundCard = styled(Box)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1.25rem;
  padding: 1.5rem;
`;

export const NotFoundTitle = styled(Typography)`
  font-size: 1.4rem !important;
  font-weight: 800 !important;
  color: #111827;
  margin-bottom: 0.4rem !important;
`;

export const NotFoundText = styled(Typography)`
  color: #64748b;
`;