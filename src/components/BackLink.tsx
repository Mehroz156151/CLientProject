import Link from "next/link";

export default function BackLink({ href }: { href: string }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-4">
      <Link
        href={href}
        className="inline-flex items-center gap-2 text-sm font-semibold text-blue hover:text-navy"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18l-6-6 6-6"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        RETOUR
      </Link>
    </div>
  );
}
