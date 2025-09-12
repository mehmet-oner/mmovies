"use client";

import { useState, type ReactElement } from "react";

export type ProviderKey =
  | "netflix"
  | "disney"
  | "hbomax"
  | "prime";

type Provider = {
  key: ProviderKey;
  label: string;
  color: string; // brand-ish color for the icon
  Icon: (props: { color?: string }) => ReactElement;
};

const NetflixIcon = ({ color = "#E50914" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="4" fill={color} />
    <path d="M9 5h2l4 14h-2L9 5zm-2 0h2v14H7V5zm8 0h2v14h-2V5z" fill="white" opacity="0.9" />
  </svg>
);

const DisneyIcon = ({ color = "#113CCF" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="6" fill={color} />
    <path d="M6 13c3-6 12-6 12-6" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
    <circle cx="12" cy="15.5" r="1.7" fill="white" />
  </svg>
);

const HbomaxIcon = ({ color = "#5B2DFF" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="6" fill={color} />
    <rect x="6.2" y="7" width="2.2" height="10" fill="white" />
    <rect x="15.6" y="7" width="2.2" height="10" fill="white" />
    <rect x="8.4" y="11.3" width="7.2" height="2.4" fill="white" />
  </svg>
);

const PrimeIcon = ({ color = "#00A8E1" }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
    <rect x="2" y="2" width="20" height="20" rx="4" fill={color} />
    <polygon points="10,8 16,12 10,16" fill="white" />
    <path d="M6 17c4 2 8 2 12 0" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
  </svg>
);

const PROVIDERS: Provider[] = [
  { key: "netflix", label: "Netflix", color: "#E50914", Icon: NetflixIcon },
  { key: "disney", label: "Disney Plus", color: "#113CCF", Icon: DisneyIcon },
  { key: "hbomax", label: "HBO Max", color: "#5B2DFF", Icon: HbomaxIcon },
  { key: "prime", label: "Amazon Prime Video", color: "#00A8E1", Icon: PrimeIcon },
];

export default function StreamingPills({
  value,
  onChange,
}: {
  value?: ProviderKey[];
  onChange?: (v: ProviderKey[]) => void;
}) {
  const [internal, setInternal] = useState<ProviderKey[]>([]);
  const selected = value ?? internal;

  const toggle = (key: ProviderKey) => {
    const next = selected.includes(key)
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    if (onChange) onChange(next);
    else setInternal(next);
  };

  return (
    <div className="flex flex-nowrap justify-center gap-3 overflow-x-auto px-1">
      {PROVIDERS.map((p) => {
        const isActive = selected.includes(p.key);
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => toggle(p.key)}
            aria-pressed={isActive}
            className={[
              "h-10 w-full rounded-full border px-3",
              "flex items-center gap-2",
              isActive
                ? "bg-foreground/10 text-foreground border-foreground/25"
                : "bg-background text-foreground/80 border-foreground/15 hover:bg-foreground/5",
              "transition-colors",
            ].join(" ")}
            style={isActive ? { boxShadow: `inset 0 0 0 2px ${p.color}` } : undefined}
          >
            <span className="inline-flex items-center justify-center h-5 w-5">
              <p.Icon color={p.color} />
            </span>
            <span className="text-xs font-medium truncate">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
