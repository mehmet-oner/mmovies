export type ProviderKey =
  | "netflix"
  | "disney"
  | "hbomax"
  | "prime";

// TMDB watch provider IDs (US region)
export const PROVIDER_IDS: Record<ProviderKey, number> = {
  netflix: 8,
  prime: 9,
  disney: 337,
  hbomax: 1825,
};
