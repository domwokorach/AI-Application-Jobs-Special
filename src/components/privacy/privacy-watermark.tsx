const densityTiles: Record<"low" | "medium" | "high", string> = {
  low: "grid-cols-2 auto-rows-44 sm:grid-cols-3",
  medium: "grid-cols-2 auto-rows-32 sm:grid-cols-3 lg:grid-cols-4",
  high: "grid-cols-3 auto-rows-24 sm:grid-cols-4 lg:grid-cols-6",
};

const densityTileCount: Record<"low" | "medium" | "high", number> = {
  low: 24,
  medium: 60,
  high: 120,
};

type PrivacyWatermarkProps = {
  /** Short confidentiality marker repeated across the overlay, e.g. "CONFIDENTIAL". */
  label?: string;
  /** Identifies the authorised viewer without exposing candidate PII, e.g. "Authorised Recruitment User". */
  userLabel?: string;
  /** ISO timestamp shown under the label. Pass a server-generated value for consistent SSR output. */
  timestamp?: string;
  /** Controls how many tiles repeat across the protected surface. */
  density?: "low" | "medium" | "high";
};

/**
 * Purely presentational, server-renderable confidentiality watermark. It carries no client
 * JavaScript so it still renders if scripts fail — the goal is that any screen capture of the
 * protected surface (including a macOS Shift+Cmd+4 region grab, which this app cannot detect or
 * block) visibly contains this marking. It never claims to prevent capture.
 */
export function PrivacyWatermark({
  label = "CONFIDENTIAL",
  userLabel,
  timestamp,
  density = "medium",
}: PrivacyWatermarkProps) {
  const dateLabel = timestamp ? new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(timestamp)) : undefined;
  const tileCount = densityTileCount[density];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-10 grid select-none overflow-hidden opacity-20 ${densityTiles[density]}`}
    >
      {Array.from({ length: tileCount }, (_, index) => (
        <div className="rotate-[-24deg] p-4 text-center text-[10px] font-semibold tracking-[0.16em] text-foreground sm:text-xs" key={index}>
          <p>{label}</p>
          {userLabel && <p className="mt-1 text-[0.6rem] font-normal tracking-normal sm:text-[0.65rem]">{userLabel}</p>}
          {dateLabel && <p className="text-[0.6rem] font-normal tracking-normal sm:text-[0.65rem]">{dateLabel}</p>}
        </div>
      ))}
    </div>
  );
}
