import Link from "next/link";
import { siteConfig } from "@/config/site";
import { portalNavigation } from "@/config/navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link className="flex items-center gap-2 font-serif text-xl font-semibold" href="/dashboard">
          <span className="grid size-8 place-items-center rounded-full bg-emerald-950 font-sans text-sm text-lime-200">N</span>
          {siteConfig.name}
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {portalNavigation.map((item) => (
            <Link className="transition-colors hover:text-foreground" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <MobileNavigation className="md:hidden" />
      </div>
    </header>
  );
}
