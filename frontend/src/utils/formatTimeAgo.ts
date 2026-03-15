export function formatTimeAgo(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);

    const diffInMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (seconds < 60) {
        return "just now";
    }

    if (minutes < 60) {
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (hours < 24) {
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    return `${days} ${days === 1 ? "day" : "days"} ago`;
}