import TopBar from "@/components/TopBar";

export const metadata = { title: "Messages — NEXUS CONTROL" };

export default function MessagesPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="font-display text-lg font-bold text-navy">
          Aucun message
        </p>
        <p className="mt-1 text-sm text-muted">
          Les communications de l&apos;unité s&apos;afficheront ici.
        </p>
      </main>
    </>
  );
}
