import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import PlayerForm from "@/components/PlayerForm";

export const metadata = { title: "Nouvelle carte — NEXUS CONTROL" };

export default function NewProfilePage() {
  return (
    <>
      <TopBar />
      <BackLink href="/" />
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