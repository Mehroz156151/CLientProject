import Link from "next/link";
import TopBar from "@/components/TopBar";
import BackLink from "@/components/BackLink";
import CardSearchForm from "@/components/CardSearchForm";
import { IconQr, IconHash } from "@/components/icons";
import { verificationLabel } from "@/lib/verification-types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  return { title: `Vérification ${verificationLabel(type)} — NEXUS CONTROL` };
}

export default async function SearchTypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const label = verificationLabel(type);

  return (
    <>
      <TopBar />
      <BackLink href="/controls" />
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <h1 className="font-display text-xl font-bold text-navy">
          VÉRIFICATION {label}
        </h1>
        <p className="mt-1 text-sm text-muted">Sélectionner le mode de recherche</p>

        <div className="mt-5 space-y-3">
          <Link
            href={`/controls/scan?type=${type}`}
            className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-4 transition hover:border-blue-light"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-navy">
              <IconQr size={22} />
            </span>
            <span className="flex-1">
              <span className="font-display block text-[15px] font-bold tracking-wide text-navy">
                SCANNER UN DOCUMENT
              </span>
              <span className="block text-sm text-muted">
                Scanner le QR code de la carte
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-blue-light">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <a
            href="#numero-carte"
            className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-4 transition hover:border-blue-light"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-navy">
              <IconHash size={22} />
            </span>
            <span className="flex-1">
              <span className="font-display block text-[15px] font-bold tracking-wide text-navy">
                NUMÉRO DE CARTE
              </span>
              <span className="block text-sm text-muted">
                Saisir le numéro manuellement
              </span>
            </span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-blue-light">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted">OU</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div id="numero-carte">
          <CardSearchForm type={type} />
        </div>
      </main>
    </>
  );
}
