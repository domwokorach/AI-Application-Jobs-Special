"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { portalNavigation } from "@/config/navigation";

export function MobileNavigation({ className }: { className?: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button aria-label="Open menu" className={className} size="icon" variant="ghost">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Primary" className="grid gap-1 px-4 pb-4">
          {portalNavigation.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href={item.href}>
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
