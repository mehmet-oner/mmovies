import Image from "next/image";
import { Movie } from "../types";
import { use } from "react";
import useIsMobile from "../hooks/useIsMobile";

interface MovieCardBaseProps {
  movie: Movie;
  overlays?: { like: boolean; nope: boolean };
  subdued?: boolean;
  priority?: boolean;
  onShowDescription?: () => void;
}
const MovieCardBase = ({
  movie,
  overlays,
  subdued,
  priority,
  onShowDescription,
}: MovieCardBaseProps) => {
  const isMobile = useIsMobile();
  const showLike = overlays?.like ?? false;
  const showNope = overlays?.nope ?? false;
  return (
    <div
      className={`h-full w-full rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5`}
    >
      <div className="relative h-[65%] bg-background p-2">
        <Image
          src={movie.poster}
          alt={movie.title}
          width={800}
          height={1200}
          priority={priority}
          className={
            "h-full w-full object-contain " + (subdued ? "opacity-90" : "")
          }
        />
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
            <h2 className="text-lg font-semibold tracking-tight">
              {movie.title}
            </h2>
            <p className="text-sm text-foreground/60">
              {movie.year} • {movie.rating.toFixed(1)}
            </p>
          </div>
          <span className="text-xs rounded-full border border-foreground/15 px-2 py-1 text-foreground/70">
            {movie.whereToWatch}
          </span>
        </div>
        <div className="mt-auto">
          <p className="text-sm text-foreground/80 line-clamp-4">
            {movie.description}
          </p>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              className={[
                "text-xs underline",
                onShowDescription
                  ? "text-foreground/70 hover:text-foreground"
                  : "invisible pointer-events-none",
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
};

export default MovieCardBase;
