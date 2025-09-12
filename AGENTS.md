# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router. Pages and features live here (`app/movies/page.tsx` is server-side; `app/movies/MoviesClient.tsx` is client-side).
- `public/` — Static assets (served from `/`).
- `app/globals.css` — Tailwind CSS v4 and theme tokens.
- `next.config.ts` — Next config (images allow `image.tmdb.org`).
- `.env.local` — Environment variables (e.g., `TMDB_API_KEY`).

## Build, Test, and Development Commands
- `npm run dev` — Start dev server at `http://localhost:3000` (Turbopack).
- `npm run build` — Production build.
- `npm run start` — Run the built app.
- `npm run lint` — ESLint (Next.js core-web-vitals config).

## Coding Style & Naming Conventions
- Language: TypeScript, React 19, Next.js 15 (App Router).
- Indentation: 2 spaces; prefer functional components and hooks.
- Server Components by default; add `"use client"` only when needed.
- Files: PascalCase for components (`MoviesClient.tsx`), route folders are lowercase (`app/movies`).
- Styling: Tailwind utility classes in JSX; keep tokens in `app/globals.css`.
- Linting: Fix issues before pushing (`npm run lint`). No Prettier; keep consistent formatting.

## Testing Guidelines
- No formal test suite yet. For new tests, prefer:
  - Unit/Component: React Testing Library + Vitest.
  - E2E/Smoke: Playwright.
- Name tests `*.test.ts(x)` and co-locate or use `__tests__/` mirroring source.
- Manual checks: ensure `/movies` loads, TMDB images render, swipe actions update the summary.

## Commit & Pull Request Guidelines
- Commits: short, imperative summaries (e.g., `add swipe animation`, `fix lint`). Group related changes.
- PRs must include: purpose and scope, before/after screenshots or GIFs for UI, verification steps, and linked issues. Note any env/config changes.

## Security & Configuration Tips
- Do not commit real secrets. Use `.env.local` (ignored) with `TMDB_API_KEY` and set vars in your deployment platform.
- Keep TMDB calls on the server (`app/movies/page.tsx`); avoid exposing keys client-side.

## Agent Notes
- Keep changes minimal and scoped to the feature. Prefer extending existing patterns over new abstractions.
- Run `npm run lint` locally before opening a PR; follow directories and naming above.

