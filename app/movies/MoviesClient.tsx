"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type Movie = {
  id: string;
  title: string;
  year: number;
  rating: number;
  description: string;
  whereToWatch: string;
  poster: string; // full URL
};

type SwipeTrigger = { count: number; direction: "left" | "right"; index: number };

export default function MoviesClient({ initial }: { initial: Movie[] }) {
  const MOVIES = initial;
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [disliked, setDisliked] = useState<string[]>([]);
  const [swipeTrigger, setSwipeTrigger] = useState<SwipeTrigger>({
    count: 0,
    direction: "right",
    index: 0,
  });

  const current = MOVIES[index];
  const next = MOVIES[index + 1];

  const onSwipe = (likedIt: boolean) => {
    const id = current?.id;
    if (!id) return;
    if (likedIt) setLiked((s) => [...s, id]);
    else setDisliked((s) => [...s, id]);
    setIndex((i) => i + 1);
  };

  if (index >= MOVIES.length) {
    const likedMovies = MOVIES.filter((m) => liked.includes(m.id));
    const dislikedMovies = MOVIES.filter((m) => disliked.includes(m.id));
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Your summary</h1>
          <p className="text-foreground/70">You swiped through {MOVIES.length} movies.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {likedMovies.map((m) => (
            <div key={m.id} className="rounded-lg overflow-hidden border border-foreground/10">
              <Image src={m.poster} alt={m.title} width={400} height={600} className="w-full h-40 object-cover" />
              <div className="p-2">
                <p className="text-sm font-medium truncate">{m.title}</p>
                <p className="text-xs text-foreground/60">{m.year} • {m.rating.toFixed(1)}</p>
              </div>
            </div>
          ))}
          {likedMovies.length === 0 && (
            <p className="col-span-full text-foreground/60">No likes yet. Try again!</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setIndex(0);
              setLiked([]);
              setDisliked([]);
            }}
            className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5"
          >
            Restart
          </button>
          <Link href="/" className="text-sm text-foreground/70 hover:text-foreground">Go home</Link>
        </div>

        <div className="mt-8 text-sm text-foreground/60">Disliked: {dislikedMovies.length}</div>
      </div>
    );
  }

  const total = MOVIES.length;
  return (
    <div className="mx-auto max-w-sm select-none">
      {/* Segmented progress bar */}
      <div className="mb-4 flex gap-1.5" aria-label="Progress">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors",
              i < index ? "bg-foreground" : i === index ? "bg-foreground/40" : "bg-foreground/15",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="relative h-[520px]">
        {next && (
          <div className="absolute inset-0 z-0 pointer-events-none scale-[0.98] translate-y-[6px] rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5" aria-hidden>
            <Image
              src={next.poster}
              alt={next.title}
              width={600}
              height={900}
              className="h-full w-full object-cover opacity-80"
              priority
            />
          </div>
        )}

        {current && (
          <MovieSwipeCard
            key={current.id}
            movie={current}
            cardIndex={index}
            onDecision={(likedIt) => onSwipe(likedIt)}
            trigger={swipeTrigger}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSwipeTrigger((t) => ({ count: t.count + 1, direction: "left", index }))}
          className="h-12 rounded-full border border-foreground/15 hover:bg-foreground/5 text-sm font-medium"
        >
          Dislike
        </button>
        <button
          onClick={() => setSwipeTrigger((t) => ({ count: t.count + 1, direction: "right", index }))}
          className="h-12 rounded-full bg-foreground text-background hover:opacity-90 text-sm font-medium"
        >
          Like
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-foreground/60">Swipe on mobile, or use buttons on web.</p>
    </div>
  );
}

function MovieSwipeCard({
  movie,
  cardIndex,
  onDecision,
  trigger,
}: {
  movie: Movie;
  cardIndex: number;
  onDecision: (likedIt: boolean) => void;
  trigger: SwipeTrigger;
}) {
  const [dx, setDx] = useState(0);
  const [isDragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  const startX = useRef(0);

  // Debounce programmatic triggers per card
  const processedTriggerKey = useRef<string>(`${trigger.index}:${trigger.count}`);
  useEffect(() => {
    if (trigger.index !== cardIndex) return;
    const key = `${trigger.index}:${trigger.count}`;
    if (processedTriggerKey.current === key) return;
    if (leaving) return; // already animating out
    processedTriggerKey.current = key;
    setLeaving(trigger.direction);
    const toLike = trigger.direction === "right";
    window.setTimeout(() => {
      onDecision(toLike);
    }, 280);
    return () => {};
  }, [trigger.count, trigger.index, trigger.direction, cardIndex, onDecision, leaving]);

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || leaving) return;
    const delta = e.clientX - startX.current;
    setDx(delta);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging || leaving) return;
    const threshold = 110;
    if (Math.abs(dx) > threshold) {
      const dir = dx > 0 ? "right" : "left";
      setLeaving(dir);
      const toLike = dir === "right";
      setTimeout(() => onDecision(toLike), 280);
      try {
        (e.target as Element).releasePointerCapture?.(e.pointerId);
      } catch {}
      setDragging(false);
      return;
    }
    setDx(0);
    setDragging(false);
  };

  const angle = Math.max(-15, Math.min(15, dx / 10));
  const style = { transform: `translateX(${dx}px) rotate(${angle}deg)` } as const;
  const leavingStyle = leaving
    ? {
        transform: `translateX(${leaving === "right" ? 700 : -700}px) rotate(${leaving === "right" ? 18 : -18}deg)`,
      }
    : undefined;

  const showLike = dx > 30 || leaving === "right";
  const showNope = dx < -30 || leaving === "left";

  return (
    <div
      className="absolute inset-0 z-10 will-change-transform touch-pan-y"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className={[
          "h-full w-full rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5",
          leaving ? "transition-transform duration-300 ease-out" : "transition-transform duration-300 ease-out",
        ].join(" ")}
        style={leaving ? leavingStyle : style}
      >
        <div className="relative h-[65%] bg-black/5">
          <Image src={movie.poster} alt={movie.title} width={800} height={1200} className="h-full w-full object-cover" />
          <div className="absolute inset-0 pointer-events-none">
            <div className={`absolute top-3 left-3 rounded-md border px-2 py-1 text-xs font-semibold ${showLike ? "opacity-100" : "opacity-0"} transition-opacity bg-emerald-500/10 border-emerald-500/30 text-emerald-600`}>LIKE</div>
            <div className={`absolute top-3 right-3 rounded-md border px-2 py-1 text-xs font-semibold ${showNope ? "opacity-100" : "opacity-0"} transition-opacity bg-rose-500/10 border-rose-500/30 text-rose-600`}>NOPE</div>
          </div>
        </div>

        <div className="h-[35%] p-4 flex flex-col bg-background border-t border-foreground/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{movie.title}</h2>
              <p className="text-sm text-foreground/60">{movie.year} • {movie.rating.toFixed(1)}</p>
            </div>
            <span className="text-xs rounded-full border border-foreground/15 px-2 py-1 text-foreground/70">{movie.whereToWatch}</span>
          </div>
          <p className="text-sm text-foreground/80 mt-3 line-clamp-4">{movie.description}</p>
        </div>
      </div>
    </div>
  );
}
