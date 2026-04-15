"use client";

import { useState } from "react";

export default function SaveSnapshotButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await fetch("/api/snapshots/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50"
      style={{
        backgroundColor: saved ? "var(--bg-card-hover)" : "var(--accent)",
        color: saved ? "var(--text-secondary)" : "#000",
        border: saved ? "1px solid var(--border)" : "none",
      }}
    >
      {loading ? "Saving…" : saved ? "Saved!" : "Save snapshot"}
    </button>
  );
}
