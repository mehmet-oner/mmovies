import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[70vh] grid place-items-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold tracking-tight">Discover movies you’ll love</h1>
        <p className="text-foreground/70 max-w-xl mx-auto">
          Swipe through a curated stack of 10 films. Like or pass to build a quick watchlist, then see a clean summary.
        </p>
        <div className="pt-2">
          <Link
            href="/movies"
            className="inline-flex items-center rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:opacity-90 transition"
          >
            Start swiping
          </Link>
        </div>
      </div>
    </div>
  );
}
