type PrivacyWatermarkProps = {
  actorId: string;
  timestamp: string;
};

export function PrivacyWatermark({ actorId, timestamp }: PrivacyWatermarkProps) {
  const date = new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(timestamp));
  const sessionLabel = `User ${actorId.slice(0, 8)}`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 grid auto-rows-32 grid-cols-2 overflow-hidden opacity-20 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 60 }, (_, index) => (
        <div className="rotate-[-24deg] p-4 text-center text-[10px] font-semibold tracking-[0.16em] text-foreground sm:text-xs" key={index}>
          <p>CONFIDENTIAL</p>
          <p className="mt-1 text-[0.6rem] font-normal tracking-normal sm:text-[0.65rem]">{sessionLabel}</p>
          <p className="text-[0.6rem] font-normal tracking-normal sm:text-[0.65rem]">{date}</p>
        </div>
      ))}
    </div>
  );
}
