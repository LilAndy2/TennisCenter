import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

type DeletePostDialogProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

function DeletePostDialog({ open, onClose, onConfirm }: DeletePostDialogProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Delete post</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to permanently delete this post?
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

export default DeletePostDialog;