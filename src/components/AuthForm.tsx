"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
        return;
      }
      setInfo("Compte créé.");
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//") ? next : "/me";
    router.push(safeNext);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-blue-light";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>E-mail</label>
        <input
          type="email"
          required
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="joueur@example.com"
        />
      </div>
      <div>
        <label className={labelClass}>Mot de passe</label>
        <input
          type="password"
          required
          minLength={6}
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      {error && <p className="text-xs font-semibold text-red">{error}</p>}
      {info && <p className="text-xs font-semibold text-green">{info}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark disabled:opacity-60"
      >
        {loading
          ? "PATIENTEZ…"
          : mode === "login"
            ? "SE CONNECTER"
            : "CRÉER MON COMPTE"}
      </button>

      <p className="text-center text-xs text-muted">
        {mode === "login" ? (
          <>
            Pas encore de compte ?{" "}
            <Link
              href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"}
              className="font-semibold text-blue"
            >
              Inscrivez-vous
            </Link>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <Link
              href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"}
              className="font-semibold text-blue"
            >
              Connectez-vous
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
