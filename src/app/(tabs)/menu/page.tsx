import Link from "next/link";
import TopBar from "@/components/TopBar";
import MenuCard from "@/components/MenuCard";
import { IconIdCard, IconSearch, IconUser } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Menu — NEXUS CONTROL" };

export default async function MenuPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <div className="space-y-3">
          <MenuCard
            href="/controls"
            icon={<IconSearch size={22} />}
            title="CONTRÔLES"
            subtitle="Lancer une vérification"
          />
          {user ? (
            <MenuCard
              href="/me"
              icon={<IconUser size={22} />}
              title="MES PERSONNAGES"
              subtitle={user.email ?? "Gérer mes profils"}
            />
          ) : (
            <MenuCard
              href="/login"
              icon={<IconUser size={22} />}
              title="CONNEXION"
              subtitle="Accéder à mes personnages"
            />
          )}
          <MenuCard
            href="/profile/new"
            icon={<IconIdCard size={22} />}
            title="CRÉER UNE CARTE"
            subtitle="Générer un profil et un QR code"
          />
        </div>

        {user && (
          <form action="/api/auth/signout" method="post" className="mt-4">
            <button
              type="submit"
              className="w-full rounded-xl border border-border bg-surface py-3 text-xs font-bold text-muted hover:bg-surface-muted"
            >
              SE DÉCONNECTER
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-muted">
          NEXUS CONTROL — projet de roleplay, à but ludique uniquement.
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-blue underline">
            Retour à l&apos;accueil
          </Link>
        </p>
      </main>
    </>
  );
}
