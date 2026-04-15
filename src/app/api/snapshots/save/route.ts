import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTopTracks, getTopArtists, getRecentlyPlayed } from "@/lib/spotify";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [tracks, artists, recent] = await Promise.allSettled([
    getTopTracks(userId, "medium_term"),
    getTopArtists(userId, "medium_term"),
    getRecentlyPlayed(userId),
  ]);

  await prisma.listeningSnapshot.create({
    data: {
      userId,
      timeRange: "medium_term",
      topTracks: tracks.status === "fulfilled" ? tracks.value : {},
      topArtists: artists.status === "fulfilled" ? artists.value : {},
      recentTracks: recent.status === "fulfilled" ? recent.value : null,
    },
  });

  return NextResponse.json({ success: true });
}
