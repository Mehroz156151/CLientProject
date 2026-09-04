import Link from "next/link";
import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import { IconUser } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Player } from "@/lib/types";

const STATUS_LABEL: Record<Player["status"], { label: string; className: string }> = {
  valid: { label: "VALIDE", className: "text-green" },
  suspended: { label: "SUSPENDUE", className: "text-amber" },
  revoked: { label: "RÉVOQUÉE", className: "text-red" },
};

export const metadata = { title: "Mes personnages — NEXUS CONTROL" };

export default async function MePage() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const admin = getSupabaseAdmin();
  const { data: players } = await admin
    .from("players")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .returns<Player[]>();

  return (
    <>
      <TopBar />
      <BackLink href="/" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-bold text-navy">
            Mes personnages
          </h1>
          <Link
            href="/profile/new"
            className="rounded-lg bg-navy px-3 py-2 text-xs font-bold text-white hover:bg-navy-dark"
          >
            + NOUVEAU
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">{user.email}</p>

        {!players || players.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border px-5 py-10 text-center">
            <p className="text-sm text-muted">
              Vous n&apos;avez encore aucun profil.
            </p>
            <Link
              href="/profile/new"
              className="mt-4 inline-block rounded-lg bg-navy px-4 py-2.5 text-xs font-bold text-white hover:bg-navy-dark"
            >
              CRÉER MON PREMIER PROFIL
            </Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {players.map((p) => {
              const status = STATUS_LABEL[p.status];
              return (
                <Link
                  key={p.id}
                  href={`/profile/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-4 hover:border-blue-light"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {p.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.avatar_url}
                        alt={p.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted">
                        <IconUser size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-navy">
                      {p.full_name}
                    </p>
                    <p className="text-xs text-muted">
                      {p.activity} · N° {p.card_number}
                    </p>
                  </div>
                  <span className={`text-xs font-bold ${status.className}`}>
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}

        <form action="/api/auth/signout" method="post" className="mt-8">
          <button
            type="submit"
            className="w-full rounded-xl border border-border bg-surface py-3 text-xs font-bold text-muted hover:bg-surface-muted"
          >
            SE DÉCONNECTER
          </button>
        </form>
      </main>
    </>
  );
}
