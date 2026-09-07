"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviousNextNavigation({
  onPrevious,
  onNext,
  isFirstStep,
  isLastStep,
  nextLabel = "Save and continue",
}: {
  onPrevious: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  nextLabel?: string;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 flex min-h-18 items-center justify-between border-t bg-white/95 px-5 py-3 backdrop-blur md:static md:mt-10 md:border-b md:bg-transparent md:px-0">
      <Button disabled={isFirstStep} onClick={onPrevious} variant="ghost">
        <ArrowLeft />
        Previous
      </Button>
      <Button onClick={onNext}>
        {isLastStep ? "Submit application" : nextLabel}
        {!isLastStep && <ArrowRight />}
      </Button>
    </nav>
  );
}
