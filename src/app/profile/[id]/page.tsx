import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import ProfileQr from "@/components/ProfileQr";
import { IconUser } from "@/components/icons";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/types";

const getPlayer = cache(async (id: string) => {
  const admin = getSupabaseAdmin();

  const { data } = await admin
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle<Player>();

  return data;
});

async function getAppUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  const h = await headers();
  const host = h.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  return {
    title: `${player?.full_name ?? "Carte"} — NEXUS CONTROL`,
  };
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (!player) {
    notFound();
  }

  // Login is OPTIONAL.
  // It is only used to determine whether the current user
  // can see the "MODIFIER LE PROFIL" button.
  const authClient = await createClient();

  const {
    data: { user },
  } = await authClient.auth.getUser();

  const isOwner = !!user && user.id === player.user_id;

  const appUrl = await getAppUrl();

  const verifyPath = `/verify/${encodeURIComponent(player.qr_token)}`;
  const verifyUrl = `${appUrl}${verifyPath}`;

  return (
    <>
      <TopBar />

      {/* Guest-created profiles always go back to home */}
      <BackLink href={isOwner ? "/me" : "/"} />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <div className="hud-corner overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-4 border-b border-border px-5 py-5">
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

            <div>
              <p className="font-display text-lg font-bold text-navy">
                {player.full_name}
              </p>

              <p className="text-sm text-muted">
                {player.activity}
              </p>

              <p className="font-mono text-xs text-muted">
                N° {player.card_number}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center px-5 py-6">
            <ProfileQr verifyUrl={verifyUrl} />

            <p className="mt-4 text-center text-xs text-muted">
              Présentez ce QR code à un agent pour vérification.
              Il pointe vers votre fiche de contrôle publique.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {/* PUBLIC — NO LOGIN REQUIRED */}
          <Link
            href={verifyPath}
            className="flex w-full items-center justify-center rounded-xl bg-navy py-3.5 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark"
          >
            APERÇU DU CONTRÔLE
          </Link>

          {/* Only profile editing requires login */}
          {isOwner && (
            <Link
              href={`/profile/edit/${player.id}`}
              className="flex w-full items-center justify-center rounded-xl border border-border bg-surface py-3.5 font-display text-sm font-bold tracking-wide text-navy hover:bg-surface-muted"
            >
              MODIFIER LE PROFIL
            </Link>
          )}
        </div>
      </main>
    </>
  );
}