const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api/v1`;

const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

export function resolveAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  )
    return url;
  if (url.startsWith("/static/")) return `${SERVER_ORIGIN}${url}`;
  return undefined;
}
