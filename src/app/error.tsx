"use client";

import { useEffect } from "react";
import Badge from "@/components/Badge";
import { IconAlert } from "@/components/icons";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
      <Badge size={40} />
      <div className="mt-4 flex items-center gap-2 text-red">
        <IconAlert size={20} />
        <p className="font-display text-lg font-bold">Une erreur est survenue</p>
      </div>
      <p className="mt-2 text-sm text-muted">
        Le chargement de cette page a échoué. Cela peut arriver en cas de
        connexion instable — réessayez.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-navy px-6 py-3 font-display text-sm font-bold tracking-wide text-white hover:bg-navy-dark"
      >
        RÉESSAYER
      </button>
    </main>
  );
}
