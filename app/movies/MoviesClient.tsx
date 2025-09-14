"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Movie, SwipeTrigger } from "./types";
import MovieCardBase from "./components/MovieCardBase";
import MovieSwipeCard from "./components/MovieSwipeCard";
import DescriptionModal from "./components/DescriptionModal";
import useIsMobile from "./hooks/useIsMobile";

interface MoviesClientProps {
  readonly initial: readonly Movie[];
}

export default function MoviesClient({ initial }: Readonly<MoviesClientProps>) {
  const isMobile = useIsMobile();
  const MOVIES = initial;
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [openDesc, setOpenDesc] = useState<null | {
    title: string;
    description: string;
  }>(null);
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
    setIndex((i) => i + 1);
  };
  const onButtonClick = (direction: "left" | "right") => {
    if (!current) return;
    setSwipeTrigger((t) => ({
      count: t.count + 1,
      direction,
      index,
    }));
    const likedIt = direction === "right";
    const id = current.id;
    if (likedIt) setLiked((s) => [...s, id]);

    setIndex((i) => i + 1);
  };

  if (index >= MOVIES.length) {
    return (
      <SummarySection
        likedMovies={MOVIES.filter((m) => liked.includes(m.id))}
        onRestart={() => {
          setIndex(0);
          setLiked([]);
        }}
      />
    );
  }

  const total = MOVIES.length;

  return (
    <div className="mx-auto max-w-sm select-none">
      {/* Segmented progress bar */}
      <ProgressBarSection index={index} total={total} />

      <div className="relative h-[520px]">
        {next && (
          <div
            className="absolute inset-0 z-0 pointer-events-none transform scale-[0.99]"
            aria-hidden
          >
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
            onShowDescription={(title, description) =>
              setOpenDesc({ title, description })
            }
          />
        )}
      </div>
      {!isMobile && <SwipeButtonSection handleClick={onButtonClick} />}
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

const ProgressBarSection = ({
  index,
  total,
}: {
  index: number;
  total: number;
}) => {
  return (
    <div className="mb-4 flex gap-1.5" aria-label="Progress">
      {Array.from({ length: total }).map((_, i) => {
        let colorClass = "bg-foreground/15";
        if (i < index) {
          colorClass = "bg-foreground";
        } else if (i === index) {
          colorClass = "bg-foreground/40";
        }
        return (
          <div
            key={i}
            className={[
              "h-1.5 flex-1 rounded-full transition-colors",
              colorClass,
            ].join(" ")}
          />
        );
      })}
    </div>
  );
};

const SwipeButtonSection = ({
  handleClick,
}: {
  handleClick: (direction: "left" | "right") => void;
}) => {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3">
      <button
        onClick={() => handleClick("left")}
        className="h-12 rounded-full border text-sm font-semibold transition-colors border-rose-500/40 text-rose-600 hover:bg-rose-500/10"
      >
        nope
      </button>
      <button
        onClick={() => handleClick("right")}
        className="h-12 rounded-full text-sm font-semibold transition-colors bg-emerald-600 text-white hover:bg-emerald-500"
      >
        yeah
      </button>
    </div>
  );
};

const SummarySection = ({
  likedMovies,
  onRestart,
}: {
  likedMovies: Movie[];
  onRestart: () => void;
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your summary</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {likedMovies.map((m) => (
          <div
            key={m.id}
            className="rounded-lg overflow-hidden border border-foreground/10"
          >
            <Image
              src={m.poster}
              alt={m.title}
              width={400}
              height={600}
              className="w-full h-40 object-cover"
            />
            <div className="p-2">
              <p className="text-sm font-medium truncate">{m.title}</p>
              <p className="text-xs text-foreground/60">
                {m.year} • {m.rating.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
        {likedMovies.length === 0 && (
          <p className="col-span-full text-foreground/60">
            No likes yet. Try again!
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onRestart}
          className="rounded-full border border-foreground/15 px-4 py-2 text-sm hover:bg-foreground/5"
        >
          Restart
        </button>
        <Link
          href="/"
          className="text-sm text-foreground/70 hover:text-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
};
