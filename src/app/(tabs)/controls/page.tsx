import Link from "next/link";
import Image from "next/image";
import TopBar from "@/components/TopBar";
import { IconMessage } from "@/components/icons";

export const metadata = {
  title: "Contrôles — NEXUS CONTROL",
};

const controls = [
  {
    href: "/messages",
    title: "MESSAGERIE",
    image: null,
  },
  {
    href: "/controls/search/identite",
    title: "RENS",
    image: "/images/rens.png",
  },
  {
    href: "/controls/search/vehicule",
    title: "FOVES",
    image: "/images/foves.png",
  },
  {
    href: "/controls/search/identite",
    title: "PERSONNES",
    image: "/images/personnes.png",
  },
  {
    href: "/controls/search/vehicule",
    title: "VÉHICULES",
    image: "/images/vehicules.png",
  },
  {
    href: "/controls/search/document",
    title: "TITRES SÉCURISÉS",
    image: "/images/titres-securises.png",
  },
  {
    href: "/controls/activity",
    title: "ACTIVITÉ PROFESSIONNELLE",
    image: "/images/activite-pro.png",
  },
];

export default function ControlsPage() {
  return (
    <>
      <TopBar />

      <main className="mx-auto w-full max-w-5xl px-5 pb-12 pt-6 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="mb-9 sm:mb-12">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute h-full w-full animate-ping rounded-full bg-blue opacity-20" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-blue" />
              </span>

              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue">
                NEXUS CONTROL
              </span>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted/60">
              07
            </span>
          </div>

          <div className="flex items-end justify-between gap-5">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-wide text-navy sm:text-4xl">
                CONTRÔLES
              </h1>

              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Sélectionnez le type de contrôle que vous souhaitez effectuer.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-border px-3.5 py-2 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-blue" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                7 contrôles disponibles
              </span>
            </div>
          </div>

          <div className="mt-6 h-px w-full bg-border" />
        </header>

        {/* Controls */}
        <section
          aria-label="Types de contrôles"
          className="grid grid-cols-2 gap-x-5 gap-y-11 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-14 lg:gap-x-16"
        >
          {controls.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className="group flex min-w-0 flex-col items-center text-center outline-none"
            >
              {/* Logo */}
              <div className="relative flex h-[125px] w-[125px] items-center justify-center sm:h-[145px] sm:w-[145px]">
                {/* Soft glow */}
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue/0 blur-2xl transition-all duration-300 group-hover:bg-blue/10 sm:h-24 sm:w-24" />

                {/* Very subtle hover ring */}
                <span className="pointer-events-none absolute inset-3 rounded-full border border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue/15" />

                {/* Logo */}
                <span className="relative flex h-[105px] w-[105px] items-center justify-center sm:h-[125px] sm:w-[125px]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={125}
                      height={125}
                      className="h-full w-full object-contain transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-95"
                    />
                  ) : (
                    <span className="flex items-center justify-center text-blue transition-all duration-300 group-hover:scale-110 group-hover:text-blue-light group-active:scale-95">
                      <IconMessage size={54} strokeWidth={1.7} />
                    </span>
                  )}
                </span>

                {/* Number */}
                <span className="absolute right-1 top-1 text-[9px] font-bold tracking-[0.15em] text-muted/40 transition-colors duration-200 group-hover:text-blue/60">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Title */}
              <span className="mt-3 max-w-[180px] font-display text-[10px] font-bold uppercase leading-[1.45] tracking-[0.1em] text-navy transition-colors duration-200 group-hover:text-blue sm:text-[11px]">
                {item.title}
              </span>

              {/* Hover indicator */}
              <span className="mt-2 flex h-1 items-center justify-center">
                <span className="h-1 w-1 rounded-full bg-blue opacity-0 transition-all duration-300 group-hover:w-9 group-hover:rounded-full group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </section>

        {/* Bottom information */}
        <div className="mt-12 flex items-center justify-center gap-3 sm:mt-16">
          <span className="h-px w-8 bg-border sm:w-12" />

          <span className="text-center text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
            Sélectionnez un contrôle
          </span>

          <span className="h-px w-8 bg-border sm:w-12" />
        </div>
      </main>
    </>
  );
}