import Link from "next/link";
import TopBar from "@/components/TopBar";
import { IconSearch, IconIdCard, IconUser } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const metadata = { title: "Accueil — NEXUS CONTROL" };

type RecentLog = {
  id: string;
  status: "valid" | "suspended" | "revoked";
  checked_at: string;
  players: { full_name: string } | { full_name: string }[] | null;
};

function recentName(row: RecentLog) {
  const p = row.players;
  if (!p) return "Profil supprimé";
  return Array.isArray(p) ? p[0]?.full_name ?? "—" : p.full_name;
}

const STATUS_LABEL: Record<RecentLog["status"], { label: string; className: string }> = {
  valid: { label: "VALIDE", className: "text-green" },
  suspended: { label: "SUSPENDU", className: "text-amber" },
  revoked: { label: "RÉVOQUÉ", className: "text-red" },
};

export default async function HomePage() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const admin = getSupabaseAdmin();

  const { data: recentLogs } = await admin
    .from("verification_logs")
    .select("id, status, checked_at, players(full_name)")
    .order("checked_at", { ascending: false })
    .limit(3)
    .returns<RecentLog[]>();

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/controls"
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-5 text-center transition hover:border-blue-light"
          >
            <IconSearch size={26} className="text-blue" />
            <span className="font-display text-sm font-bold text-navy">
              Nouveau contrôle
            </span>
          </Link>
          <Link
            href={user ? "/me" : "/login"}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-4 py-5 text-center transition hover:border-blue-light"
          >
            <IconUser size={26} className="text-blue" />
            <span className="font-display text-sm font-bold text-navy">
              {user ? "Mes personnages" : "Se connecter"}
            </span>
          </Link>
        </div>

        <Link
          href="/profile/new"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-center text-sm font-semibold text-blue hover:border-blue-light"
        >
          <IconIdCard size={18} />
          Créer une carte de personnage
        </Link>

        <section className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted">
            Derniers contrôles
          </p>
          {!recentLogs || recentLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              Aucun contrôle effectué pour le moment.
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((row) => {
                const status = STATUS_LABEL[row.status];
                return (
                  <div
                    key={row.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-navy">
                      {recentName(row)}
                    </span>
                    <span className={`text-xs font-bold ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
