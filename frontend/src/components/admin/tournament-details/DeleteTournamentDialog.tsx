import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import styled from "styled-components";

type DeleteTournamentDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function DeleteTournamentDialog({
                                    open,
                                    onClose,
                                    onConfirm,
                                }: DeleteTournamentDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete tournament</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to permanently delete this tournament?
                </Typography>
            </DialogContent>
            <DialogActions>
                <DialogButton onClick={onClose}>Cancel</DialogButton>
                <DeleteConfirmButton onClick={onConfirm}>Delete</DeleteConfirmButton>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteTournamentDialog;

const DialogButton = styled.button`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
  cursor: pointer;
`;

const DeleteConfirmButton = styled.button`
  height: 2.6rem;
  padding: 0 1rem;
  border: none;
  border-radius: 999px;
  background: #dc2626;
  color: white;
  font-weight: 700;
  cursor: pointer;
`;