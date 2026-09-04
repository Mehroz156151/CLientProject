"use client";

import { useState } from "react";
import AvatarUploader from "./AvatarUploader";
import type { Player } from "@/lib/types";

const ACTIVITIES = ["TAXI", "VTC", "TRANSPORT", "AUTRE"] as const;
const STATUSES = [
  { value: "valid", label: "VALIDE" },
  { value: "suspended", label: "SUSPENDUE" },
  { value: "revoked", label: "RÉVOQUÉE" },
] as const;

type Props =
  | { mode: "create"; player?: undefined }
  | { mode: "edit"; player: Player };

export default function PlayerForm(props: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = props.mode === "edit";
  const player = isEdit ? props.player : undefined;

  const [form, setForm] = useState(() => {
    const today = new Date();
    const inFiveYears = new Date(today);
    inFiveYears.setFullYear(inFiveYears.getFullYear() + 5);
    const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

    return {
      full_name: player?.full_name ?? "",
      date_of_birth: player?.date_of_birth ?? "",
      activity: (player?.activity ?? "VTC") as (typeof ACTIVITIES)[number],
      agency: player?.agency ?? "",
      card_number: player?.card_number ?? "",
      issued_at: player?.issued_at ?? toDateInput(today),
      expires_at: player?.expires_at ?? toDateInput(inFiveYears),
      vehicle_plate: player?.vehicle_plate ?? "",
      vehicle_model: player?.vehicle_model ?? "",
      avatar_url: player?.avatar_url ?? "",
      status: (player?.status ?? "valid") as (typeof STATUSES)[number]["value"],
    };
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit) {
        const res = await fetch("/api/players/update", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: player!.id, ...form }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Impossible de mettre à jour le profil.");
          setLoading(false);
          return;
        }
        // Full browser navigation rather than router.push: this is the
        // one transition that consistently failed with a client-side RSC
        // streaming glitch in testing, while a hard reload never did.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = `/profile/${player!.id}`;
        return;
      }

      const res = await fetch("/api/players/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Impossible de créer le profil.");
        setLoading(false);
        return;
      }
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/profile/${data.id}`;
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-navy outline-none focus:border-blue-light";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-muted";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Photo</label>
        <AvatarUploader
          value={form.avatar_url}
          onChange={(url) => update("avatar_url", url)}
        />
      </div>

      <div>
        <label className={labelClass}>Nom complet du personnage</label>
        <input
          required
          className={inputClass}
          placeholder="Jean DUPONT"
          value={form.full_name}
          onChange={(e) => update("full_name", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Date de naissance</label>
          <input
            type="date"
            className={inputClass}
            value={form.date_of_birth}
            onChange={(e) => update("date_of_birth", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Activité</label>
          <select
            className={inputClass}
            value={form.activity}
            onChange={(e) => update("activity", e.target.value)}
          >
            {ACTIVITIES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isEdit && (
        <>
          <div>
            <label className={labelClass}>Numéro de carte</label>
            <input
              className={inputClass}
              placeholder="Laissez vide pour générer automatiquement"
              value={form.card_number}
              onChange={(e) => update("card_number", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Délivrée le</label>
              <input
                type="date"
                className={inputClass}
                value={form.issued_at}
                onChange={(e) => update("issued_at", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>Expire le</label>
              <input
                type="date"
                className={inputClass}
                value={form.expires_at}
                onChange={(e) => update("expires_at", e.target.value)}
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Agence / organisation</label>
        <input
          className={inputClass}
          placeholder="Nexus Transports"
          value={form.agency}
          onChange={(e) => update("agency", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Plaque du véhicule</label>
          <input
            className={inputClass}
            placeholder="RP-482-XZ"
            value={form.vehicle_plate}
            onChange={(e) => update("vehicle_plate", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Modèle du véhicule</label>
          <input
            className={inputClass}
            placeholder="Vapid Dominator"
            value={form.vehicle_model}
            onChange={(e) => update("vehicle_model", e.target.value)}
          />
        </div>
      </div>

      {isEdit && (
        <div>
          <label className={labelClass}>Statut de la carte</label>
          <select
            className={inputClass}
            value={form.status}
            onChange={(e) => update("status", e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted">
            Contrôle du statut affiché lors d&apos;une vérification (pour
            simuler une carte suspendue ou révoquée en RP).
          </p>
        </div>
      )}

      {error && <p className="text-xs font-semibold text-red">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark disabled:opacity-60"
      >
        {loading
          ? "ENREGISTREMENT…"
          : isEdit
          ? "ENREGISTRER LES MODIFICATIONS"
          : "CRÉER LE PROFIL ET LE QR CODE"}
      </button>
    </form>
  );
}
