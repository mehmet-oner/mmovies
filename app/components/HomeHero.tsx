"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import StreamingPills, { type ProviderKey as PillsKey } from "./StreamingPills";

export default function HomeHero() {
  const [selected, setSelected] = useState<PillsKey[]>([]);

  const href = useMemo(() => {
    if (!selected.length) return "/movies";
    // pass provider KEYS; server will map to TMDB IDs and use OR (|)
    const query = encodeURIComponent(selected.join("|"));
    return `/movies?providers=${query}`;
  }, [selected]);

  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-semibold tracking-tight">Discover movies you’ll love</h1>
      <p className="text-foreground/70 max-w-xl mx-auto">
        Swipe through a curated stack of 10 films. Like or pass to build a quick watchlist, then see a clean summary.
      </p>
      <div className="pt-4">
        <StreamingPills value={selected} onChange={setSelected} />
      </div>
      <div className="pt-4">
        <Link
          href={href}
          className="inline-flex items-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition"
        >
          Start swiping
        </Link>
      </div>
    </div>
  );
}
