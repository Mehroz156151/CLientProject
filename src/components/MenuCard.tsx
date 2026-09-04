import Link from "next/link";
import type { ReactNode } from "react";

export default function MenuCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-4 transition hover:border-blue-light hover:shadow-[0_0_0_1px_var(--blue-light)]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-muted text-navy">
        {icon}
      </span>
      <span className="flex-1">
        <span className="font-display block text-[15px] font-bold tracking-wide text-navy">
          {title}
        </span>
        <span className="block text-sm text-muted">{subtitle}</span>
      </span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        className="shrink-0 text-blue-light transition group-hover:translate-x-0.5"
      >
        <path
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
