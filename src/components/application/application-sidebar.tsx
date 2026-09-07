import { Check, Circle, CircleDot, CircleHelp, Minus } from "lucide-react";
import type { ApplicationStep } from "@/types";

export function ApplicationStepList({
  steps,
  current,
  onSelect,
}: {
  steps: ApplicationStep[];
  current: number;
  onSelect: (index: number) => void;
}) {
  return (
    <ol className="grid gap-1">
      {steps.map((step, index) => {
        const complete = index < current;
        const active = index === current;
        const Icon = complete ? Check : active ? CircleDot : step.optional ? Minus : Circle;
        const status = complete ? "Completed" : active ? "Current step" : step.optional ? "Optional" : "Not started";
        return (
          <li key={step.id}>
            <button
              aria-current={active ? "step" : undefined}
              className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70 ${active ? "bg-primary-foreground/12 font-semibold text-primary-foreground" : "text-primary-foreground/75 hover:bg-primary-foreground/8 hover:text-primary-foreground"}`}
              onClick={() => onSelect(index)}
              type="button"
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${complete ? "border-success bg-success text-success-foreground" : active ? "border-primary-foreground bg-primary-foreground text-primary" : "border-primary-foreground/40 text-primary-foreground"}`}
              >
                <Icon aria-hidden="true" className="size-3.5" />
              </span>
              <span className="flex-1">{step.label}</span>
              <span className="sr-only">{status}</span>
              {step.optional && <span className="text-[10px] font-medium uppercase tracking-wider text-primary-foreground/65">Optional</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ApplicationSidebar({
  jobTitle,
  jobMeta,
  steps,
  current,
  onSelect,
  className,
}: {
  jobTitle: string;
  jobMeta: string;
  steps: ApplicationStep[];
  current: number;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <aside className={`w-(--sidebar-width) flex-col border-r border-primary-foreground/20 bg-[#2B2B2B] px-6 py-7 text-primary-foreground ${className ?? ""}`}>
      <a className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-tight" href="#">
        <span className="grid size-8 place-items-center rounded-full border border-primary-foreground/75 font-sans text-xs">AI</span>
        AI Application Fast Specialist
      </a>
      <div className="mt-12 border-b border-white/15 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/70">Your application</p>
        <h2 className="mt-2 font-serif text-xl leading-tight">{jobTitle}</h2>
        <p className="mt-2 text-sm text-primary-foreground/70">{jobMeta}</p>
      </div>
      <nav aria-label="Application steps" className="mt-5 overflow-y-auto">
        <ApplicationStepList current={current} onSelect={onSelect} steps={steps} />
      </nav>
      <a className="mt-auto flex items-center gap-2 text-xs text-primary-foreground/80 underline underline-offset-4" href="mailto:recruitment@aiapplicationfastspecialist.example">
        <CircleHelp className="size-4" />
        Need help? Contact recruitment
      </a>
    </aside>
  );
}
