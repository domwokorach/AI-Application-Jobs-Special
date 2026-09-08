"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SiteFooterProps {
  organisationName: string;
  showTerms?: boolean;
  showPrivacy?: boolean;
  showAccessibility?: boolean;
  className?: string;
}

const legalLinks = [
  { href: "/terms", label: "Terms & Conditions", enabled: "showTerms" },
  { href: "/privacy", label: "Privacy Policy", enabled: "showPrivacy" },
  { href: "/accessibility", label: "Accessibility", enabled: "showAccessibility" },
] as const;

export function SiteFooter({
  organisationName,
  showTerms = true,
  showPrivacy = true,
  showAccessibility = true,
  className,
}: SiteFooterProps) {
  const pathname = usePathname();
  const visibility = { showTerms, showPrivacy, showAccessibility };

  return (
    <footer className={`border-t border-border bg-background ${className ?? ""}`}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-8">
        <p>© 2026 {organisationName}</p>
        <nav aria-label="Legal and accessibility" className="flex flex-col items-start gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
          {legalLinks.filter((link) => visibility[link.enabled]).map((link) => (
            <Link
              aria-current={pathname === link.href ? "page" : undefined}
              className="min-h-11 py-2 underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
