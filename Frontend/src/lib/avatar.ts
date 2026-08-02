export function resolveAvatarUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("data:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  )
    return url;
  return undefined;
}
