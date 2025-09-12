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
  const [openDesc, setOpenDesc] = useState<null | { title: string; description: string }>(null);
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
          <div className="absolute inset-0 z-0 pointer-events-none transform scale-[0.99]" aria-hidden>
            <MovieCardBase movie={next} subdued priority />
          </div>
        )}

        {current && (
          <MovieSwipeCard
            key={current.id}
            movie={current}
            cardIndex={index}
            onDecision={(likedIt) => onSwipe(likedIt)}
            trigger={swipeTrigger}
            onShowDescription={(title, description) => setOpenDesc({ title, description })}
          />
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          onClick={() => setSwipeTrigger((t) => ({ count: t.count + 1, direction: "left", index }))}
          className="h-12 rounded-full border text-sm font-semibold transition-colors border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
        >
          nope
        </button>
        <button
          onClick={() => setSwipeTrigger((t) => ({ count: t.count + 1, direction: "right", index }))}
          className="h-12 rounded-full text-sm font-semibold transition-colors bg-emerald-600 text-white hover:bg-emerald-500"
        >
          yeah
        </button>
      </div>
      {openDesc && (
        <DescriptionModal
          title={openDesc.title}
          description={openDesc.description}
          onClose={() => setOpenDesc(null)}
        />
      )}
    </div>
  );
}

function MovieSwipeCard({
  movie,
  cardIndex,
  onDecision,
  trigger,
  onShowDescription,
}: {
  movie: Movie;
  cardIndex: number;
  onDecision: (likedIt: boolean) => void;
  trigger: SwipeTrigger;
  onShowDescription: (title: string, description: string) => void;
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
        className="h-full w-full transition-transform duration-300 ease-out"
        style={leaving ? leavingStyle : style}
      >
        <MovieCardBase
          movie={movie}
          overlays={{ like: showLike, nope: showNope }}
          onShowDescription={() => onShowDescription(movie.title, movie.description)}
        />
      </div>
    </div>
  );
}

function MovieCardBase({
  movie,
  overlays,
  subdued,
  priority,
  onShowDescription,
}: {
  movie: Movie;
  overlays?: { like: boolean; nope: boolean };
  subdued?: boolean;
  priority?: boolean;
  onShowDescription?: () => void;
}) {
  const showLike = overlays?.like ?? false;
  const showNope = overlays?.nope ?? false;
  return (
    <div className={["h-full w-full rounded-2xl overflow-hidden border", subdued ? "border-foreground/10 bg-foreground/5" : "border-foreground/10 bg-foreground/5"].join(" ") }>
      <div className="relative h-[65%] bg-background p-2">
        <Image src={movie.poster} alt={movie.title} width={800} height={1200} priority={priority} className={"h-full w-full object-contain " + (subdued ? "opacity-90" : "")} />
        {/* Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {/* YEAH (left side/top-left) */}
          <div
            className={[
              "absolute top-4 left-4 select-none",
              "transform -rotate-6",
              showLike ? "opacity-100" : "opacity-0",
              "transition-opacity duration-200",
            ].join(" ")}
          >
            <div className="px-3 py-1 rounded-md border-2 border-emerald-500/80 bg-emerald-600/15 text-emerald-600/95 text-lg font-extrabold tracking-widest shadow-[0_0_0_1px_rgba(16,185,129,0.2)]">
              yeah
            </div>
          </div>
          {/* NOPE (top-right) */}
          <div
            className={[
              "absolute top-4 right-4 select-none",
              "transform rotate-6",
              showNope ? "opacity-100" : "opacity-0",
              "transition-opacity duration-200",
            ].join(" ")}
          >
            <div className="px-3 py-1 rounded-md border-2 border-rose-500/80 bg-rose-600/15 text-rose-600/95 text-lg font-extrabold tracking-widest shadow-[0_0_0_1px_rgba(244,63,94,0.2)]">
              nope
            </div>
          </div>
        </div>
      </div>

      {/* Bottom info area */}
      <div className="h-[35%] p-4 flex flex-col bg-background">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{movie.title}</h2>
            <p className="text-sm text-foreground/60">{movie.year} • {movie.rating.toFixed(1)}</p>
          </div>
          <span className="text-xs rounded-full border border-foreground/15 px-2 py-1 text-foreground/70">{movie.whereToWatch}</span>
        </div>
        <div className="mt-auto">
          <p className="text-sm text-foreground/80 line-clamp-4">{movie.description}</p>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className={[
                "text-xs underline",
                onShowDescription ? "text-foreground/70 hover:text-foreground" : "invisible pointer-events-none",
              ].join(" ")}
              onClick={(e) => {
                e.stopPropagation();
                onShowDescription?.();
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              more
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DescriptionModal({
  title,
  description,
  onClose,
}: {
  title: string;
  description: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="desc-modal-title"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-background border border-foreground/15 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-foreground/10 flex items-center justify-between">
          <h2 id="desc-modal-title" className="text-lg font-semibold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-foreground/70 hover:bg-foreground/5"
            aria-label="Close"
          >
            Close
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto text-sm text-foreground/80 whitespace-pre-line">
          {description}
        </div>
      </div>
    </div>
  );
}
