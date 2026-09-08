"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ApplicationSidebar } from "@/components/application/application-sidebar";
import { MobileApplicationNav } from "@/components/application/mobile-application-nav";
import { ApplicationProgress } from "@/components/application/application-progress";
import { SaveStatus } from "@/components/application/save-status";
import type { ApplicationStep } from "@/types";

export function ApplicationShell({
  children,
  current,
  onSelect,
  steps,
  jobTitle = "Customer Experience Associate",
  jobMeta = "London · Hybrid · Full time",
}: {
  children: React.ReactNode;
  current: number;
  onSelect: (index: number) => void;
  steps: ApplicationStep[];
  jobTitle?: string;
  jobMeta?: string;
}) {
  return (
    <div className="flex min-h-dvh min-w-0 bg-background text-foreground">
      <ApplicationSidebar
        className="fixed inset-y-0 hidden xl:flex"
        current={current}
        jobMeta={jobMeta}
        jobTitle={jobTitle}
        onSelect={onSelect}
        steps={steps}
      />

      <div className="min-w-0 flex-1 bg-background xl:pl-(--sidebar-width)">
        <header className="sticky top-0 z-20 flex min-w-0 h-(--header-height) items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <MobileApplicationNav className="xl:hidden" current={current} onSelect={onSelect} steps={steps} />
          <SaveStatus className="hidden md:flex" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost">
                Save and exit
              </Button>
            </TooltipTrigger>
            <TooltipContent>Continue your application later</TooltipContent>
          </Tooltip>
        </header>
        <div className="border-b bg-card px-5 py-3 xl:hidden">
          <ApplicationProgress current={current} label={steps[current]?.label} total={steps.length} />
        </div>
        {children}
      </div>
    </div>
  );
}
