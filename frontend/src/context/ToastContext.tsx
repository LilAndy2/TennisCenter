import { createContext, useContext, useState, type ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

type ToastSeverity = "success" | "error" | "warning" | "info";

type ToastContextType = {
    showToast: (message: string, severity?: ToastSeverity) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<ToastSeverity>("error");

    const showToast = (msg: string, sev: ToastSeverity = "error") => {
        setMessage(msg);
        setSeverity(sev);
        setOpen(true);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={4000}
                onClose={() => setOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={severity} onClose={() => setOpen(false)} variant="filled">
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx;
}