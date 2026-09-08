import { Circle, CircleAlert, CircleCheck, CircleDot, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatApplicationActivityDate } from "@/lib/format-application-activity-date";
import type { ApplicationTimelineStep, TimelineStatus } from "@/features/applications/types/tracking.types";

const STATUS_CONFIG: Record<TimelineStatus, { icon: typeof Circle; iconClassName: string; label: string }> = {
  COMPLETED: { icon: CircleCheck, iconClassName: "text-foreground", label: "Completed" },
  CURRENT: { icon: CircleDot, iconClassName: "text-foreground", label: "Current" },
  PENDING: { icon: Circle, iconClassName: "text-muted-foreground", label: "Pending" },
  OVERDUE: { icon: CircleAlert, iconClassName: "text-destructive", label: "Overdue" },
  ACTION_REQUIRED: { icon: CircleAlert, iconClassName: "text-destructive", label: "Action required" },
  CLOSED: { icon: CircleSlash, iconClassName: "text-muted-foreground", label: "Closed" },
};

function StepIcon({ status }: { status: TimelineStatus }) {
  const { icon: Icon, iconClassName } = STATUS_CONFIG[status];
  return (
    <span className="grid size-5 shrink-0 place-items-center">
      <Icon aria-hidden className={cn("size-5", iconClassName)} />
    </span>
  );
}

function StatusLabel({ status }: { status: TimelineStatus }) {
  const { label } = STATUS_CONFIG[status];
  return <span className="text-xs font-medium text-muted-foreground">{label}</span>;
}

export function ApplicationTimeline({
  steps,
  className,
}: {
  steps: ApplicationTimelineStep[];
  currentStage: string;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        return (
          <li
            aria-current={step.status === "CURRENT" ? "step" : undefined}
            className="relative flex gap-4 pb-8 last:pb-0"
            key={step.id}
          >
            <div className="flex flex-col items-center">
              <StepIcon status={step.status} />
              {!isLast && <span aria-hidden className="mt-1 w-px flex-1 bg-border" />}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <StatusLabel status={step.status} />
                {step.nextStep && step.status === "PENDING" && (
                  <span className="text-xs font-medium text-muted-foreground">Next</span>
                )}
              </div>
              {step.description && <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>}
              {step.occurredAt && (
                <p className="mt-1 text-xs text-muted-foreground">{formatApplicationActivityDate(step.occurredAt)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
