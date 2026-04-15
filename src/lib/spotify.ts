import { prisma } from "@/lib/prisma";

async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "spotify" },
  });
  return account?.access_token ?? null;
}

async function spotifyFetch(
  userId: string,
  endpoint: string,
  params?: Record<string, string>
) {
  const token = await getAccessToken(userId);
  if (!token) throw new Error("No Spotify access token");

  const url = new URL(`https://api.spotify.com/v1${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status}`);
  }

  return res.json();
}

export type TimeRange = "short_term" | "medium_term" | "long_term";

export async function getTopTracks(userId: string, timeRange: TimeRange = "medium_term") {
  return spotifyFetch(userId, "/me/top/tracks", {
    time_range: timeRange,
    limit: "50",
  });
}

export async function getTopArtists(userId: string, timeRange: TimeRange = "medium_term") {
  return spotifyFetch(userId, "/me/top/artists", {
    time_range: timeRange,
    limit: "50",
  });
}

export async function getRecentlyPlayed(userId: string) {
  return spotifyFetch(userId, "/me/player/recently-played", { limit: "50" });
}

export async function getCurrentlyPlaying(userId: string) {
  const token = await getAccessToken(userId);
  if (!token) return null;

  const res = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 30 },
  });

  if (res.status === 204 || !res.ok) return null;
  return res.json();
}

export async function getUserProfile(userId: string) {
  return spotifyFetch(userId, "/me");
}
