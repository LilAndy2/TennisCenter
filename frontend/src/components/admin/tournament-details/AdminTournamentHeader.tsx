import { ArrowBack, DeleteOutline, EditOutlined } from "@mui/icons-material";
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import styled from "styled-components";

type AdminTournamentHeaderProps = {
    onBack: () => void;
    onEdit: () => void;
    onDelete: () => void;
    extraActions?: ReactNode;
};

function AdminTournamentHeader({
                                   onBack,
                                   onEdit,
                                   onDelete,
                                   extraActions,
                               }: AdminTournamentHeaderProps) {
    return (
        <TopBar>
            <BackButton onClick={onBack}>
                <ArrowBack sx={{ fontSize: 18 }} />
                <span>Back to admin dashboard</span>
            </BackButton>

            <TopBarActions>
                {extraActions}

                <SecondaryActionButton onClick={onEdit}>
                    <EditOutlined sx={{ fontSize: 18 }} />
                    <span>Edit tournament</span>
                </SecondaryActionButton>

                <DangerActionButton onClick={onDelete}>
                    <DeleteOutline sx={{ fontSize: 18 }} />
                    <span>Delete tournament</span>
                </DangerActionButton>
            </TopBarActions>
        </TopBar>
    );
}

export default AdminTournamentHeader;

const TopBar = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 64rem) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TopBarActions = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const BackButton = styled.button`
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

const SecondaryActionButton = styled.button`
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

  &:hover {
    background: #059669;
  }
`;

const DangerActionButton = styled.button`
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

  &:hover {
    background: #fecaca;
  }
`;