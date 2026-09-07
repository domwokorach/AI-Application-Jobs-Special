"use client";

import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ApplicationStepList } from "@/components/application/application-sidebar";
import type { ApplicationStep } from "@/types";

export function MobileApplicationNav({
  steps,
  current,
  onSelect,
  className,
}: {
  steps: ApplicationStep[];
  current: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <Sheet>
        <SheetTrigger asChild>
          <Button aria-label="Open application navigation" size="icon" variant="ghost">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[min(88vw,360px)] border-0 bg-primary p-0 text-primary-foreground" side="left">
          <SheetHeader className="flex-row items-center justify-between border-b border-primary-foreground/15 px-6 py-6 text-left">
            <SheetTitle className="font-serif text-xl text-primary-foreground">Your application</SheetTitle>
            <SheetClose asChild>
              <Button aria-label="Close navigation" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" size="icon" variant="ghost">
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <nav aria-label="Application steps" className="max-h-[calc(100vh-100px)] overflow-y-auto px-4 py-5">
            <ApplicationStepList current={current} onSelect={onSelect} steps={steps} />
          </nav>
        </SheetContent>
      </Sheet>
      <span className="font-serif text-lg font-semibold">AI Application Fast Specialist</span>
    </div>
  );
}
