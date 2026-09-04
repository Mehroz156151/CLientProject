import { redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import PlayerForm from "@/components/PlayerForm";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Nouvelle carte — NEXUS CONTROL" };

export default async function NewProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <>
      <TopBar />
      <BackLink href="/me" />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          Créer un profil joueur
        </h1>
        <p className="mt-1 text-sm text-muted">
          Un QR code unique sera généré automatiquement pour ce profil.
        </p>
        <div className="mt-6">
          <PlayerForm mode="create" />
        </div>
      </main>
    </>
  );
}
