"use client";

import { useRouter, usePathname } from "next/navigation";
import type { TimeRange } from "@/lib/spotify";

const tabs: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "All time" },
];

export default function TimeRangeTabs({ current }: { current: TimeRange }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex gap-1">
      {tabs.map((tab) => {
        const isActive = current === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => router.push(`${pathname}?range=${tab.value}`)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
            style={{
              backgroundColor: isActive ? "var(--bg-card-hover)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              border: isActive ? "1px solid var(--border)" : "1px solid transparent",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
