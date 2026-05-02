const API_BASE = "http://localhost:8080";

export function resolveImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url}`;
}