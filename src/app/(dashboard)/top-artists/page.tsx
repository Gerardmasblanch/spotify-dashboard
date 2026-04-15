import { auth } from "@/lib/auth";
import { getTopArtists, type TimeRange } from "@/lib/spotify";
import TimeRangeTabs from "@/components/ui/TimeRangeTabs";

type Artist = {
  id: string;
  name: string;
  images: { url: string }[];
  genres: string[];
  popularity: number;
  followers: { total: number };
};

export default async function TopArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const range = (params.range as TimeRange) || "medium_term";
  const data = await getTopArtists(session.user.id, range);
  const artists: Artist[] = data?.items ?? [];

  const rangeLabels: Record<TimeRange, string> = {
    short_term: "Last 4 weeks",
    medium_term: "Last 6 months",
    long_term: "All time",
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Top Artists
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {rangeLabels[range]} · {artists.length} artists
        </p>
      </div>

      <TimeRangeTabs current={range} />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
        {artists.map((artist, i) => (
          <div
            key={artist.id}
            className="rounded-xl border p-4 flex flex-col items-center text-center transition-colors"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
          >
            <div className="relative mb-3">
              <span
                className="absolute -top-1 -left-1 w-5 h-5 rounded-full text-xs flex items-center justify-center font-mono z-10"
                style={{
                  backgroundColor: i < 3 ? "var(--accent)" : "var(--bg-card-hover)",
                  color: i < 3 ? "#000" : "var(--text-muted)",
                  fontSize: "10px",
                }}
              >
                {i + 1}
              </span>
              {artist.images?.[1]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.images[1].url}
                  alt={artist.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--bg-card-hover)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)" }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-sm font-medium mb-1 line-clamp-1 w-full" style={{ color: "var(--text-primary)" }}>
              {artist.name}
            </p>
            {artist.genres?.[0] && (
              <p className="text-xs line-clamp-1 w-full" style={{ color: "var(--text-muted)" }}>
                {artist.genres[0]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
