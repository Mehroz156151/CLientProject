import { notFound, redirect } from "next/navigation";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import PlayerForm from "@/components/PlayerForm";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Player } from "@/lib/types";

export const metadata = { title: "Modifier la carte — NEXUS CONTROL" };

export default async function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const admin = getSupabaseAdmin();
  const { data: player } = await admin
    .from("players")
    .select("*")
    .eq("id", id)
    .maybeSingle<Player>();

  if (!player) notFound();
  if (player.user_id !== user.id) redirect(`/profile/${id}`);

  return (
    <>
      <TopBar />
      <BackLink href={`/profile/${id}`} />
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          Modifier le profil de {player.full_name}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Le QR code et le numéro de carte restent inchangés.
        </p>
        <div className="mt-6">
          <PlayerForm mode="edit" player={player} />
        </div>
      </main>
    </>
  );
}
