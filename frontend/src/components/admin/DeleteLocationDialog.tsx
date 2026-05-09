import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type DeleteLocationDialogProps = {
    open: boolean;
    locationName?: string;
    onClose: () => void;
    onConfirm: () => void;
};

function DeleteLocationDialog({ open, locationName, onClose, onConfirm }: DeleteLocationDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete location</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to permanently delete{" "}
                    <strong>{locationName ?? "this location"}</strong>? All associated courts
                    will also be removed. This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="error" variant="contained" onClick={onConfirm}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteLocationDialog;