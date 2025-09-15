import { useEffect, useRef, useState } from "react";
import { Movie, SwipeTrigger } from "../types";
import MovieCardBase from "./MovieCardBase";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";

interface MovieSwipeCardProps {
  movie: Movie;
  cardIndex: number;
  onDecision: (likedIt: boolean) => void;
  trigger: SwipeTrigger;
  onShowDescription: (title: string, description: string) => void;
}

const NUDGE_PIXELS = 80; // how far to nudge during the demo
// const NUDGE_STEP_MS = 16; // ~60fps
const NUDGE_DURATION_MS = 6000; // total duration of the wiggle

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

  // Used to cancel animations/timeouts when component unmounts or state changes.
  const rafRef = useRef<number | null>(null);
  const timeoutRefs = useRef<number[]>([]);

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
    timeoutRefs.current.push(
      window.setTimeout(() => {
        onDecision(toLike);
      }, 280)
    );
    return () => {};
  }, [
    trigger.count,
    trigger.index,
    trigger.direction,
    cardIndex,
    onDecision,
    leaving,
  ]);

  // Call the hook (was previously referenced without invoking)
  const prefersReducedMotion = usePrefersReducedMotion();

  // Respect reduced motion: clear dynamic movement
  useEffect(() => {
    if (prefersReducedMotion) {
      setDx(0);
      setIsDragging(false);
      setLeaving(null);
    }
  }, [prefersReducedMotion]);

  // Demo "help" nudge on mount (every page load), for this card only.
  // It runs only when:
  // - reduced motion is not preferred
  // - card isn't being dragged and not leaving
  // - this is the active/top card according to trigger.index
  useEffect(() => {
    if (prefersReducedMotion) return;
    if (isDragging || leaving) return;
    if (trigger.index !== cardIndex) return;

    // simple eased wiggle: 0 -> +NUDGE -> -NUDGE -> 0
    const start = performance.now();
    const duration = NUDGE_DURATION_MS;

    const animate = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // piecewise: first half to +NUDGE, second half to -NUDGE, then settle to 0 at the end
      let val = 0;
      if (t < 0.5) {
        // ease-out to +NUDGE
        const p = t / 0.5; // 0..1
        const eased = 1 - Math.pow(1 - p, 3);
        val = eased * NUDGE_PIXELS;
      } else if (t < 0.9) {
        // ease-out to -NUDGE
        const p = (t - 0.5) / 0.4; // 0..1 (shorter segment for snappier counter move)
        const eased = 1 - Math.pow(1 - p, 3);
        val = NUDGE_PIXELS - eased * (NUDGE_PIXELS * 2); // from +NUDGE down to -NUDGE
      } else {
        // ease back to 0
        const p = (t - 0.9) / 0.1; // last 10%
        const eased = 1 - Math.pow(1 - p, 3);
        val = -NUDGE_PIXELS + eased * NUDGE_PIXELS; // -NUDGE -> 0
      }

      setDx(val);

      if (t < 1 && !isDragging && !leaving) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // settle exactly at 0 to avoid tiny residuals
        setDx(0);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    // cleanup: cancel raf/timeouts on unmount or when deps change
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      timeoutRefs.current.forEach((id) => clearTimeout(id));
      timeoutRefs.current = [];
    };
  }, [prefersReducedMotion, isDragging, leaving, trigger.index, cardIndex]);

  const onPointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    (e.target as Element).setPointerCapture?.(e.pointerId);

    // cancel any running demo animation immediately when the user interacts
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
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
      const id = window.setTimeout(() => onDecision(toLike), 280);
      timeoutRefs.current.push(id);
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
