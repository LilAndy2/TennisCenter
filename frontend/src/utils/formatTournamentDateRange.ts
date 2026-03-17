export function formatTournamentDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startFormatted = start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });

    const endFormatted = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return `${startFormatted} - ${endFormatted}`;
}