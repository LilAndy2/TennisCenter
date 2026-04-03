import { Close } from "@mui/icons-material";
import {
    Box,
    Dialog,
    DialogContent,
    IconButton,
    Alert,
    Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import styled from "styled-components";
import type { MatchSet, TournamentMatch } from "../../../types/match";

type UpdateMatchScoreDialogProps = {
    open: boolean;
    match: TournamentMatch | null;
    onClose: () => void;
    onSubmit: (sets: MatchSet[]) => Promise<void>;
};

function UpdateMatchScoreDialog({
                                    open,
                                    match,
                                    onClose,
                                    onSubmit,
                                }: UpdateMatchScoreDialogProps) {
    const [sets, setSets] = useState<MatchSet[]>([
        {
            setNumber: 1,
            playerOneGames: 0,
            playerTwoGames: 0,
            playerOneTiebreakPoints: null,
            playerTwoTiebreakPoints: null,
        },
        {
            setNumber: 2,
            playerOneGames: 0,
            playerTwoGames: 0,
            playerOneTiebreakPoints: null,
            playerTwoTiebreakPoints: null,
        },
        {
            setNumber: 3,
            playerOneGames: 0,
            playerTwoGames: 0,
            playerOneTiebreakPoints: null,
            playerTwoTiebreakPoints: null,
        },
    ]);
    const [submitError, setSubmitError] = useState<string | null>(null);

    useEffect(() => {
        if (open && match) {
            setSubmitError(null);
            if (match.sets.length > 0) {
                setSets([
                    ...match.sets,
                    ...Array.from({ length: Math.max(0, 3 - match.sets.length) }, (_, index) => ({
                        setNumber: match.sets.length + index + 1,
                        playerOneGames: 0,
                        playerTwoGames: 0,
                        playerOneTiebreakPoints: null,
                        playerTwoTiebreakPoints: null,
                    })),
                ]);
            } else {
                setSets([
                    {
                        setNumber: 1,
                        playerOneGames: 0,
                        playerTwoGames: 0,
                        playerOneTiebreakPoints: null,
                        playerTwoTiebreakPoints: null,
                    },
                    {
                        setNumber: 2,
                        playerOneGames: 0,
                        playerTwoGames: 0,
                        playerOneTiebreakPoints: null,
                        playerTwoTiebreakPoints: null,
                    },
                    {
                        setNumber: 3,
                        playerOneGames: 0,
                        playerTwoGames: 0,
                        playerOneTiebreakPoints: null,
                        playerTwoTiebreakPoints: null,
                    },
                ]);
            }
        }
    }, [open, match]);

    const handleSetChange = (
        setIndex: number,
        field: keyof MatchSet,
        value: number | null
    ) => {
        setSets((previous) =>
            previous.map((set, index) =>
                index === setIndex ? { ...set, [field]: value } : set
            )
        );
    };

    const handleSubmit = async () => {
        const filteredSets = sets.filter(
            (set) => set.playerOneGames > 0 || set.playerTwoGames > 0
        );

        try {
            setSubmitError(null);
            await onSubmit(filteredSets);
            onClose();
        } catch {
            setSubmitError(
                "Invalid score format. Use valid tennis set scores (6-0..6-4, 7-5, 7-6 with tie-break)."
            );
        }
    };

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContentWrapper>
                <HeaderRow>
                    <HeaderTitle>Update match score</HeaderTitle>

                    <IconButton onClick={onClose}>
                        <Close />
                    </IconButton>
                </HeaderRow>

                <MatchTitle>
                    {match?.playerOneName ?? "TBD"} vs {match?.playerTwoName ?? "TBD"}
                </MatchTitle>

                {submitError ? <CompactAlert severity="error">{submitError}</CompactAlert> : null}

                <SetsWrapper>
                    {sets.map((set, index) => (
                        <SetCard key={set.setNumber}>
                            <SetTitle>Set {set.setNumber}</SetTitle>

                            <InputsRow>
                                <ScoreField>
                                    <FieldLabel>Player 1 games</FieldLabel>
                                    <StyledInput
                                        type="number"
                                        min="0"
                                        value={set.playerOneGames}
                                        onChange={(e) =>
                                            handleSetChange(
                                                index,
                                                "playerOneGames",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </ScoreField>

                                <ScoreField>
                                    <FieldLabel>Player 2 games</FieldLabel>
                                    <StyledInput
                                        type="number"
                                        min="0"
                                        value={set.playerTwoGames}
                                        onChange={(e) =>
                                            handleSetChange(
                                                index,
                                                "playerTwoGames",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </ScoreField>
                            </InputsRow>

                            <InputsRow>
                                <ScoreField>
                                    <FieldLabel>Player 1 tiebreak</FieldLabel>
                                    <StyledInput
                                        type="number"
                                        min="0"
                                        value={set.playerOneTiebreakPoints ?? ""}
                                        onChange={(e) =>
                                            handleSetChange(
                                                index,
                                                "playerOneTiebreakPoints",
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                    />
                                </ScoreField>

                                <ScoreField>
                                    <FieldLabel>Player 2 tiebreak</FieldLabel>
                                    <StyledInput
                                        type="number"
                                        min="0"
                                        value={set.playerTwoTiebreakPoints ?? ""}
                                        onChange={(e) =>
                                            handleSetChange(
                                                index,
                                                "playerTwoTiebreakPoints",
                                                e.target.value === "" ? null : Number(e.target.value)
                                            )
                                        }
                                    />
                                </ScoreField>
                            </InputsRow>
                        </SetCard>
                    ))}
                </SetsWrapper>

                <BottomRow>
                    <CancelButton onClick={onClose}>Cancel</CancelButton>
                    <SaveButton onClick={handleSubmit}>Save score</SaveButton>
                </BottomRow>
            </DialogContentWrapper>
        </StyledDialog>
    );
}

export default UpdateMatchScoreDialog;

const StyledDialog = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 1rem;
    max-height: min(88vh, 52rem);
  }
`;

const DialogContentWrapper = styled(DialogContent)`
  padding: 0.95rem 1rem 1rem !important;
`;

const HeaderRow = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const HeaderTitle = styled(Typography)`
  font-size: 1.05rem !important;
  font-weight: 800 !important;
`;

const MatchTitle = styled(Typography)`
  font-size: 0.94rem !important;
  font-weight: 700 !important;
  color: #111827;
  margin-bottom: 0.7rem !important;
`;

const CompactAlert = styled(Alert)`
  margin-bottom: 0.7rem !important;
`;

const SetsWrapper = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

const SetCard = styled(Box)`
  border: 1px solid #e5e7eb;
  border-radius: 0.8rem;
  padding: 0.75rem;
  background: #f8fafc;
`;

const SetTitle = styled(Typography)`
  font-size: 0.86rem !important;
  font-weight: 800 !important;
  margin-bottom: 0.5rem !important;
`;

const InputsRow = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.55rem;
  margin-bottom: 0.5rem;
`;

const ScoreField = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const FieldLabel = styled(Typography)`
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #475569;
`;

const StyledInput = styled.input`
  height: 2.2rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.65rem;
  padding: 0 0.65rem;
  font-size: 0.88rem;
`;

const BottomRow = styled(Box)`
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.8rem;
`;

const CancelButton = styled.button`
  height: 2.45rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;

const SaveButton = styled.button`
  height: 2.45rem;
  padding: 0 0.95rem;
  border: none;
  border-radius: 999px;
  background: #10b981;
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
`;