import { PlayArrow, Flag } from "@mui/icons-material";
import { Box } from "@mui/material";
import styled from "styled-components";
import type { TournamentType } from "../../../types/tournament";

type AdminTournamentStatusActionsProps = {
    tournament: TournamentType;
    onStart: () => void;
    onFinish: () => void;
};

function AdminTournamentStatusActions({
                                          tournament,
                                          onStart,
                                          onFinish,
                                      }: AdminTournamentStatusActionsProps) {
    if (tournament.status === "Finished") {
        return null;
    }

    return (
        <ActionsRow>
            {tournament.status === "Upcoming" ? (
                <StartButton onClick={onStart}>
                    <PlayArrow sx={{ fontSize: 18 }} />
                    <span>Start tournament</span>
                </StartButton>
            ) : null}

            {tournament.status === "Ongoing" ? (
                <FinishButton onClick={onFinish}>
                    <Flag sx={{ fontSize: 18 }} />
                    <span>Finish tournament</span>
                </FinishButton>
            ) : null}
        </ActionsRow>
    );
}

export default AdminTournamentStatusActions;

const ActionsRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StartButton = styled.button`
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

const FinishButton = styled.button`
  height: 2.8rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f59e0b;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    background: #d97706;
  }
`;