import { auth } from "@/lib/auth";
import { getRecentlyPlayed } from "@/lib/spotify";

type PlayedItem = {
  played_at: string;
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: { name: string; images: { url: string }[] };
    duration_ms: number;
  };
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function msToMinSec(ms: number) {
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function RecentPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const data = await getRecentlyPlayed(session.user.id);
  const items: PlayedItem[] = data?.items ?? [];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Recently Played
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Last {items.length} tracks
        </p>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {items.map((item, i) => (
            <div key={`${item.track.id}-${i}`} className="flex items-center gap-4 px-5 py-3.5">
              {item.track.album?.images?.[2]?.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.track.album.images[2].url}
                  alt=""
                  className="w-10 h-10 rounded flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {item.track.name}
                </p>
                <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                  {item.track.artists.map((a) => a.name).join(", ")} · {item.track.album.name}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {timeAgo(item.played_at)}
                </span>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                  {msToMinSec(item.track.duration_ms)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
