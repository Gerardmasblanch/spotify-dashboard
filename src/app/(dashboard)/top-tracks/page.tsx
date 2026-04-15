import { auth } from "@/lib/auth";
import { getTopTracks, type TimeRange } from "@/lib/spotify";
import TimeRangeTabs from "@/components/ui/TimeRangeTabs";

type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  popularity: number;
};

function msToMinSec(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function TopTracksPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const range = (params.range as TimeRange) || "medium_term";
  const data = await getTopTracks(session.user.id, range);
  const tracks: Track[] = data?.items ?? [];

  const rangeLabels: Record<TimeRange, string> = {
    short_term: "Last 4 weeks",
    medium_term: "Last 6 months",
    long_term: "All time",
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Top Tracks
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {rangeLabels[range]} · {tracks.length} tracks
        </p>
      </div>

      <TimeRangeTabs current={range} />

      <div
        className="rounded-xl border overflow-hidden mt-5"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {tracks.map((track, i) => (
            <div
              key={track.id}
              className="flex items-center gap-4 px-5 py-3.5 transition-colors"
              style={{ backgroundColor: "transparent" }}
            >
              <span
                className="text-xs w-6 text-right flex-shrink-0 font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {i + 1}
              </span>
              {track.album?.images?.[2]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={track.album.images[2].url}
                  alt=""
                  className="w-10 h-10 rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {track.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {track.artists.map((a) => a.name).join(", ")} · {track.album.name}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${track.popularity * 0.4}px`,
                      backgroundColor: "var(--accent)",
                      opacity: 0.6,
                    }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {track.popularity}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {msToMinSec(track.duration_ms)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
