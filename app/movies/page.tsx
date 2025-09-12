import MoviesClient, { type Movie } from "./MoviesClient";
import { PROVIDER_IDS, type ProviderKey } from "../lib/providers";

type TMDBMovie = {
  id: number;
  poster_path: string | null;
  overview: string;
  title?: string;
  original_title?: string;
  release_date?: string;
  vote_average?: number;
};

async function fetchRandomMovies(providerKeys: ProviderKey[] = []): Promise<Movie[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY is missing");

  const region = "US";
  const providerIds = providerKeys
    .map((k) => PROVIDER_IDS[k])
    .filter((n): n is number => typeof n === "number");
  const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const pageA = rnd(1, 200);
  const pageB = rnd(1, 200);

  const baseUrl = "https://api.themoviedb.org/3";

  // Build discover URL with optional provider filter (OR semantics with "|")
  const discover = async (page: number): Promise<TMDBMovie[]> => {
    const withProviders = providerIds.length
      ? `&with_watch_providers=${encodeURIComponent(providerIds.join("|"))}`
      : "";
    const url = `${baseUrl}/discover/movie?api_key=${apiKey}&include_adult=false&include_video=false&language=en-US&sort_by=popularity.desc&page=${page}&watch_region=${region}${withProviders}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`TMDB discover failed: ${res.status}`);
    const data = (await res.json()) as { results: TMDBMovie[] };
    return data.results;
  };

  const [a, b] = await Promise.all([discover(pageA), discover(pageB)]);
  const merged = [...a, ...b].filter((m): m is TMDBMovie => Boolean(m && m.poster_path && m.overview));

  // Shuffle and take up to 10
  for (let i = merged.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [merged[i], merged[j]] = [merged[j], merged[i]];
  }
  const selected = merged.slice(0, 10);

  // Fetch providers per movie (best effort)
  const providersFor = async (id: number) => {
    try {
      const res = await fetch(`${baseUrl}/movie/${id}/watch/providers?api_key=${apiKey}`, { cache: "no-store" });
      if (!res.ok) return "—";
      const json = await res.json();
      const r = json.results?.[region];
      const pick = r?.flatrate?.[0]?.provider_name || r?.ads?.[0]?.provider_name || r?.buy?.[0]?.provider_name || r?.rent?.[0]?.provider_name;
      return pick || "—";
    } catch {
      return "—";
    }
  };

  const withProviders = await Promise.all(
    selected.map(async (m: TMDBMovie) => {
      const where = await providersFor(m.id);
      const year = (m.release_date || "").slice(0, 4);
      return {
        id: String(m.id),
        title: m.title || m.original_title || "Untitled",
        year: Number(year || 0),
        rating: Number(m.vote_average || 0),
        description: m.overview || "",
        whereToWatch: where,
        poster: `https://image.tmdb.org/t/p/w342${m.poster_path}`,
      } satisfies Movie;
    })
  );

  return withProviders;
}

export default async function MoviesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const raw = typeof searchParams?.providers === "string"
    ? searchParams?.providers
    : Array.isArray(searchParams?.providers)
    ? searchParams?.providers.join("|")
    : "";
  const keys = raw ? (raw.split("|").filter(Boolean) as ProviderKey[]) : [];
  const movies = await fetchRandomMovies(keys);
  return <MoviesClient initial={movies} />;
}
