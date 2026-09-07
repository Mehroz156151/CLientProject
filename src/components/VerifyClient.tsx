"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Player } from "@/lib/types";
import {
  IconAlert,
  IconCar,
  IconCheck,
  IconDocument,
  IconRefresh,
  IconUser,
} from "@/components/icons";
import { verificationCopy } from "@/lib/verification-types";

type Result = {
  player: Player | null;
};

const MIN_LOADING_MS = 1100;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("fr-FR");
}

export default function VerifyClient({
  token,
  type,
}: {
  token: string;
  type: string;
}) {
  const [result, setResult] = useState<Result | null>(null);
  const [verifiedAt, setVerifiedAt] = useState<string>("");

  const copy = verificationCopy(type);

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    fetch(`/api/players/${token}?type=${type}`)
      .then((res) => res.json())
      .then((data: Result) => {
        const elapsed = Date.now() - started;
        const wait = Math.max(0, MIN_LOADING_MS - elapsed);

        setTimeout(() => {
          if (cancelled) return;

          setResult(data);

          setVerifiedAt(
            new Date().toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
        }, wait);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({ player: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, type]);

  /*
   * CHARGEMENT
   */
  if (!result) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <p className="font-display text-sm font-bold uppercase tracking-[0.15em] text-navy">
          Vérification en cours
        </p>

        <div className="mt-10 flex items-center gap-3">
          <span className="h-3 w-3 rounded-full border-2 border-blue-light" />

          <span
            className="h-3 w-3 animate-pulse-dot rounded-full bg-blue-light"
            style={{ animationDelay: "0.15s" }}
          />

          <span
            className="h-3 w-3 animate-pulse-dot rounded-full bg-blue-light"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

        <p className="mt-8 text-sm text-muted">
          Recherche : {copy.cardTitle.toLowerCase()}…
        </p>

        <p className="mt-1 text-xs text-muted">
          Veuillez patienter
        </p>
      </main>
    );
  }

  const player = result.player;

  /*
   * PROFIL INTROUVABLE
   */
  if (!player) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <div className="hud-corner overflow-hidden rounded-xl border border-red/30 bg-surface">
          <div className="border-b border-border px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {copy.cardTitle}
            </p>

            <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-red/10 px-3 py-1">
              <IconAlert
                size={16}
                className="text-red"
              />

              <span className="text-sm font-bold text-red">
                INTROUVABLE
              </span>
            </div>
          </div>

          <div className="px-5 py-6 text-center">
            <p className="text-sm text-muted">
              Aucun élément ne correspond à cette référence.
              Elle est peut-être invalide, expirée ou n&apos;existe
              pas dans nos bases.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Link
            href="/controls"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark"
          >
            <IconRefresh size={18} />
            NOUVEAU CONTRÔLE
          </Link>

          <Link
            href="/"
            className="flex w-full items-center justify-center rounded-xl border border-border bg-surface py-3.5 font-display text-sm font-bold tracking-wide text-navy hover:bg-surface-muted"
          >
            TERMINER
          </Link>
        </div>
      </main>
    );
  }

  const isValid = player.status === "valid";

  /*
   * IMPORTANT :
   * Le véhicule est volontairement TOUJOURS considéré
   * comme inconnu / non vérifié.
   */
  const vehicleOk = false;

  const statusLabel =
    player.status === "valid"
      ? "VALIDE"
      : player.status === "suspended"
        ? "SUSPENDUE"
        : "RÉVOQUÉE";

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
      <div className="hud-corner overflow-hidden rounded-xl border border-border bg-surface">

        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              {copy.cardTitle}
            </p>

            <div
              className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 ${
                isValid
                  ? "bg-green/10"
                  : "bg-red/10"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isValid
                    ? "bg-green"
                    : "bg-red"
                }`}
              />

              <span
                className={`text-sm font-bold ${
                  isValid
                    ? "text-green"
                    : "text-red"
                }`}
              >
                {statusLabel}
              </span>
            </div>

            <p className="mt-2 text-xs text-muted">
              Vérifiée aujourd&apos;hui à {verifiedAt}
            </p>
          </div>

          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
            {player.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.avatar_url}
                alt={player.full_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted">
                <IconUser size={28} />
              </div>
            )}
          </div>
        </div>

        {/* TITULAIRE */}
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Titulaire
          </p>

          <p className="mt-1 font-display text-lg font-bold text-navy">
            {player.full_name}
          </p>

          <p className="text-sm text-muted">
            Né le {formatDate(player.date_of_birth)}
          </p>
        </div>

        {/* DÉTAILS DE LA CARTE */}
        {copy.showCardDetails && (
          <div className="grid grid-cols-2 gap-4 border-b border-border px-5 py-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                N°
              </p>

              <p className="mt-0.5 font-mono font-semibold text-navy">
                {player.card_number}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                Activité
              </p>

              <p className="mt-0.5 font-semibold text-navy">
                {player.activity}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                Délivrée le
              </p>

              <p className="mt-0.5 font-semibold text-navy">
                {formatDate(player.issued_at)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
                Expire le
              </p>

              <p className="mt-0.5 font-semibold text-navy">
                {formatDate(player.expires_at)}
              </p>
            </div>
          </div>
        )}

        {/* VÉHICULE */}
        {copy.showVehicle && (
          <div className="border-b border-border px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
              Véhicule
            </p>

            <div className="mt-2 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red/10 text-red">
                <IconCar size={18} />
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red">
                  Véhicule inconnu
                </p>

                <p className="text-xs text-muted">
                  Aucun véhicule vérifié pour ce contrôle.
                </p>
              </div>

              {/* CROIX ROUGE TOUJOURS VISIBLE */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red/10 text-red">
                <span className="text-2xl font-bold leading-none">
                  ×
                </span>
              </span>
            </div>
          </div>
        )}

        {/* CONTRÔLE */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Contrôle
          </p>

          <ul className="mt-2 space-y-2">
            {copy.checklist.map((label) => {
              const isVehicleCheck =
                label === copy.vehicleCheckLabel;

              const isOk = isVehicleCheck
                ? vehicleOk
                : isValid;

              return (
                <li
                  key={label}
                  className="flex items-center gap-2 text-sm"
                >
                  {isOk ? (
                    <IconCheck
                      size={16}
                      className="shrink-0 text-green"
                    />
                  ) : (
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-red">
                      <span className="text-xl font-bold leading-none">
                        ×
                      </span>
                    </span>
                  )}

                  <span
                    className={
                      isVehicleCheck
                        ? "font-semibold text-red"
                        : "text-navy"
                    }
                  >
                    {isVehicleCheck
                      ? "Véhicule inconnu"
                      : label}
                  </span>
                </li>
              );
            })}
          </ul>

          {/* RÉSUMÉ DU CONTRÔLE */}
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${
              isValid && !vehicleOk
                ? "bg-red/10 text-red"
                : isValid
                  ? "bg-green/10 text-green"
                  : "bg-red/10 text-red"
            }`}
          >
            {isValid && !vehicleOk
              ? "Anomalie détectée : véhicule inconnu"
              : isValid
                ? "Aucune anomalie relevée"
                : "Anomalie détectée sur ce profil"}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="mt-4 space-y-2">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface py-3.5 font-display text-sm font-bold tracking-wide text-navy hover:bg-surface-muted"
        >
          <IconDocument size={18} />
          CONSULTER LES DÉTAILS
        </button>

        <Link
          href="/controls"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark"
        >
          <IconRefresh size={18} />
          NOUVEAU CONTRÔLE
        </Link>

        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-xl border border-border bg-surface py-3.5 font-display text-sm font-bold tracking-wide text-navy hover:bg-surface-muted"
        >
          TERMINER
        </Link>
      </div>
    </main>
  );
}