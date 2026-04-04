import axios from "axios";

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.error ?? "Something went wrong.";
    }
    return "An unexpected error occurred.";
}