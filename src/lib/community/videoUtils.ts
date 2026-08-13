/** Helpers for community video posts */

export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/,
    /youtube\.com\/embed\/([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export function getVideoThumbnail(url: string): string | null {
  const ytId = getYouTubeVideoId(url);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return null;
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|mov|webm|m3u8)(\?|$)/i.test(url);
}

export function normalizeVideoUrl(input: string): string {
  return input.trim();
}
