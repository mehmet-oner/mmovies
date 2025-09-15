import Image from "next/image";
import { Movie } from "../types";
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

  // Pastel gradients
  const gradientColors = showLike
    ? "from-emerald-200 via-emerald-300 to-emerald-200"
    : showNope
    ? "from-rose-200 via-rose-300 to-rose-200"
    : "from-foreground/10 via-foreground/15 to-foreground/10";

  // Pastel thumb colors
  const thumbUpColor = "text-emerald-300";
  const thumbDownColor = "text-rose-300";

  return (
    <div className="relative h-full w-full">
      {/* Thicker gradient frame */}
      <div
        className={`absolute inset-0 rounded-2xl p-[8px] bg-gradient-to-r ${gradientColors} transition-all duration-500`}
        aria-hidden
      >
        <div className="h-full w-full rounded-[20px] bg-background overflow-hidden relative">
          {/* subtle pastel glow */}
          <div
            className={`pointer-events-none absolute inset-[-10%] rounded-[28px] bg-gradient-to-r ${gradientColors} blur-3xl opacity-40`}
          />
        </div>
      </div>

      {/* card surface */}
      <div className="relative h-full w-full rounded-2xl overflow-hidden border border-transparent">
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

          {/* centered thumbs overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* thumbs-up (right swipe) */}
            <div
              className={[
                "absolute transition-all duration-200",
                showLike ? "opacity-90 scale-100" : "opacity-0 scale-95",
              ].join(" ")}
              style={{
                filter: "drop-shadow(0 4px 14px rgba(167,243,208,0.45))", // minty glow
              }}
              aria-hidden
            >
              <span
                className={`text-[92px] md:text-[104px] leading-none ${thumbUpColor}`}
              >
                👍
              </span>
            </div>

            {/* thumbs-down (left swipe) */}
            <div
              className={[
                "absolute transition-all duration-200",
                showNope ? "opacity-90 scale-100" : "opacity-0 scale-95",
              ].join(" ")}
              style={{
                filter: "drop-shadow(0 4px 14px rgba(254,205,211,0.45))", // pink glow
              }}
              aria-hidden
            >
              <span
                className={`text-[92px] md:text-[104px] leading-none ${thumbDownColor}`}
              >
                👎
              </span>
            </div>
          </div>
        </div>

        {/* info area */}
        <div className="h-[35%] p-4 flex flex-col bg-background relative">
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
    </div>
  );
};

export default MovieCardBase;
