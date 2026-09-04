"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { IconIdCard, IconSearch } from "./icons";

export default function CardSearchForm({ type }: { type: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!value.trim()) {
      setError("Veuillez saisir un numéro de carte professionnelle.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/players/search?card_number=${encodeURIComponent(value.trim())}`
      );
      const data = await res.json();

      if (data.token) {
        router.push(`/verify/${data.token}?type=${type}`);
      } else {
        router.push(
          `/verify/not-found?type=${type}&ref=${encodeURIComponent(value.trim())}`
        );
      }
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSearch} className="mt-8">
      <p className="text-sm font-semibold uppercase tracking-[0.1em] text-navy">
        Rechercher par
      </p>
      <div className="mt-3 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3.5">
        <IconIdCard size={20} className="text-muted" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Numéro de carte professionnelle"
          className="flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-muted"
          inputMode="numeric"
        />
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white transition hover:bg-navy-dark disabled:opacity-60"
      >
        <IconSearch size={18} />
        {loading ? "RECHERCHE…" : "RECHERCHER"}
      </button>
    </form>
  );
}
