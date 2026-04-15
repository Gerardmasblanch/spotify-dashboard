import { auth } from "@/lib/auth";
import { getUserProfile } from "@/lib/spotify";
import { prisma } from "@/lib/prisma";
import SaveSnapshotButton from "@/components/ui/SaveSnapshotButton";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [spotifyProfile, snapshots] = await Promise.allSettled([
    getUserProfile(userId),
    prisma.listeningSnapshot.findMany({
      where: { userId },
      orderBy: { savedAt: "desc" },
      take: 10,
    }),
  ]);

  const profile = spotifyProfile.status === "fulfilled" ? spotifyProfile.value : null;
  const savedSnapshots = snapshots.status === "fulfilled" ? snapshots.value : [];

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
          Profile
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Your Spotify account and saved snapshots
        </p>
      </div>

      <div
        className="rounded-xl border p-6 mb-6 flex items-center gap-5"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {session.user.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={session.user.image}
            alt={session.user.name ?? ""}
            className="w-16 h-16 rounded-full flex-shrink-0"
          />
        )}
        <div>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {session.user.name}
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {session.user.email}
          </p>
          {profile?.followers?.total !== undefined && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {profile.followers.total.toLocaleString()} followers on Spotify
            </p>
          )}
        </div>
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        <div
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <h2 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Saved Snapshots
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              Save your current listening data to track changes over time
            </p>
          </div>
          <SaveSnapshotButton userId={userId} />
        </div>

        {savedSnapshots.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No snapshots yet. Save your first one above.
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {savedSnapshots.map((snap: { id: string; timeRange: string; savedAt: Date }) => (
              <div key={snap.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm" style={{ color: "var(--text-primary)" }}>
                    {snap.timeRange === "short_term"
                      ? "4 weeks"
                      : snap.timeRange === "medium_term"
                      ? "6 months"
                      : "All time"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {new Date(snap.savedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--bg-card-hover)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  saved
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
