import styled from "styled-components";

export const DialogCancelButton = styled.button`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
  }
`;

export const DialogDangerButton = styled.button`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #b91c1c;
  }
`;

export const DialogSaveButton = styled.button`
  height: 2.45rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #059669;
  }
`;

export const DialogNeutralButton = styled.button`
  height: 2.45rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;

  &:hover {
    background: #e2e8f0;
  }
`;