"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviousNextNavigation({
  onPrevious,
  onNext,
  isFirstStep,
  isLastStep,
  nextLabel = "Save and continue",
  showNext = true,
}: {
  onPrevious: () => void;
  onNext?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
  showNext?: boolean;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex min-h-18 min-w-0 items-center justify-between gap-3 border-t bg-background/95 px-5 py-3 backdrop-blur md:static md:mt-10 md:border-b md:bg-transparent md:px-0">
      <Button className="min-w-28 flex-1 md:flex-none" disabled={isFirstStep} onClick={onPrevious} variant="ghost">
        <ArrowLeft />
        Previous
      </Button>
      {showNext && onNext && <Button className="min-w-40 flex-1 md:flex-none" onClick={onNext}>
        {isLastStep ? "Submit application" : nextLabel}
        {!isLastStep && <ArrowRight />}
      </Button>}
    </nav>
  );
}
