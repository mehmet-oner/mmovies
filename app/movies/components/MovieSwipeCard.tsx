import { useEffect, useRef, useState } from "react";
import { Movie, SwipeTrigger } from "../types";
import MovieCardBase from "./MovieCardBase";

interface MovieSwipeCardProps {
  movie: Movie;
  cardIndex: number;
  onDecision: (likedIt: boolean) => void;
  trigger: SwipeTrigger;
  onShowDescription: (title: string, description: string) => void;
}

const MovieSwipeCard = ({
  movie,
  cardIndex,
  onDecision,
  trigger,
  onShowDescription,
}: MovieSwipeCardProps) => {
  const [dx, setDx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [leaving, setLeaving] = useState<null | "left" | "right">(null);
  const startX = useRef(0);

  // Debounce programmatic triggers per card
  const processedTriggerKey = useRef<string>(
    `${trigger.index}:${trigger.count}`
  );
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
  }, [
    trigger.count,
    trigger.index,
    trigger.direction,
    cardIndex,
    onDecision,
    leaving,
  ]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
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
      setIsDragging(false);
      return;
    }
    setDx(0);
    setIsDragging(false);
  };

  const angle = Math.max(-15, Math.min(15, dx / 10));
  const style = {
    transform: `translateX(${dx}px) rotate(${angle}deg)`,
  } as const;
  const leavingStyle = leaving
    ? {
        transform: `translateX(${leaving === "right" ? 700 : -700}px) rotate(${
          leaving === "right" ? 18 : -18
        }deg)`,
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
          onShowDescription={() =>
            onShowDescription(movie.title, movie.description)
          }
        />
      </div>
    </div>
  );
};

export default MovieSwipeCard;
