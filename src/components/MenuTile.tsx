import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export default function MenuTile({
  href,
  icon,
  image,
  title,
  variant = "light",
}: {
  href: string;
  icon?: ReactNode;
  image?: { src: string; alt: string };
  title: string;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={
        isDark
          ? "group flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-navy-dark px-3 py-5 text-center transition hover:border-blue-light"
          : "group flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-5 text-center transition hover:border-blue-light hover:shadow-[0_0_0_1px_var(--blue-light)]"
      }
    >
      {image ? (
        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/50">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="56px"
            className="object-cover"
          />
        </span>
      ) : (
        <span
          className={
            isDark
              ? "flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition group-hover:bg-white/20"
              : "flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-navy transition group-hover:bg-blue-light/10"
          }
        >
          {icon}
        </span>
      )}
      <span
        className={
          isDark
            ? "font-display text-xs font-bold uppercase leading-tight tracking-wide text-white"
            : "font-display text-xs font-bold uppercase leading-tight tracking-wide text-navy"
        }
      >
        {title}
      </span>
    </Link>
  );
}
