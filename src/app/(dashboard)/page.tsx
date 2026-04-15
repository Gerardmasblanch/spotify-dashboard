import { auth } from "@/lib/auth";
import { getTopTracks, getTopArtists, getCurrentlyPlaying } from "@/lib/spotify";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl p-5 border"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
    >
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [topTracks, topArtists, nowPlaying] = await Promise.allSettled([
    getTopTracks(userId, "short_term"),
    getTopArtists(userId, "short_term"),
    getCurrentlyPlaying(userId),
  ]);

  const tracks = topTracks.status === "fulfilled" ? topTracks.value?.items ?? [] : [];
  const artists = topArtists.status === "fulfilled" ? topArtists.value?.items ?? [] : [];
  const playing = nowPlaying.status === "fulfilled" ? nowPlaying.value : null;

  const topTrack = tracks[0];
  const topArtist = artists[0];

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Here&apos;s your listening overview for the last 4 weeks
        </p>
      </div>

      {playing?.is_playing && playing?.item && (
        <div
          className="rounded-xl p-5 border mb-8 flex items-center gap-4"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--accent)" }}
        >
          <div className="relative flex-shrink-0">
            {playing.item.album?.images?.[0]?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={playing.item.album.images[0].url}
                alt={playing.item.album.name}
                className="w-12 h-12 rounded"
              />
            )}
            <span
              className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
              style={{ backgroundColor: "var(--accent)", borderColor: "var(--bg-card)" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--accent)" }}>
              Now Playing
            </p>
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {playing.item.name}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
              {playing.item.artists?.map((a: { name: string }) => a.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Top Track" value={topTrack?.name ?? "—"} />
        <StatCard label="Top Artist" value={topArtist?.name ?? "—"} />
        <StatCard label="Tracks Tracked" value={tracks.length.toString()} />
        <StatCard label="Artists Tracked" value={artists.length.toString()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Top Tracks this month
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {tracks.slice(0, 5).map((track: { id: string; name: string; artists: { name: string }[]; album: { images: { url: string }[] } }, i: number) => (
              <div key={track.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                {track.album?.images?.[2]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={track.album.images[2].url} alt="" className="w-8 h-8 rounded flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {track.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Top Artists this month
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {artists.slice(0, 5).map((artist: { id: string; name: string; images: { url: string }[] }, i: number) => (
              <div key={artist.id} className="flex items-center gap-3 px-5 py-3">
                <span className="text-xs w-5 text-right flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                  {i + 1}
                </span>
                {artist.images?.[2]?.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={artist.images[2].url} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                )}
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {artist.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
