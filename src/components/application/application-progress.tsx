import { Progress } from "@/components/ui/progress";

export function ApplicationProgress({ current, label, total }: { current: number; label?: string; total: number }) {
  const percentage = Math.round(((current + 1) / total) * 100);
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs text-muted-foreground">
        <span>Step {current + 1} of {total}</span>
        <span className="font-semibold text-foreground">
          {current + 1} of {total}
        </span>
      </div>
      {label && <p className="mb-2 text-sm font-medium text-foreground">{label}</p>}
      <Progress aria-label={`${percentage}% of application complete`} value={percentage} />
    </div>
  );
}
