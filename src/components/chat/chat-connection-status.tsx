import { cn } from "cn";
import type { ChatConnectionState } from "@/lib/socket/types";

const STATUS_COPY: Record<ChatConnectionState, { label: string; dotClassName: string }> = {
  CONNECTING: { label: "Connecting…", dotClassName: "bg-muted-foreground" },
  ONLINE: { label: "Online · Mock chat", dotClassName: "bg-success" },
  RECONNECTING: { label: "Reconnecting…", dotClassName: "bg-warning motion-safe:animate-pulse" },
  OFFLINE: { label: "Offline", dotClassName: "bg-destructive" },
};

export function ChatConnectionStatus({ state, className }: { state: ChatConnectionState; className?: string }) {
  const { label, dotClassName } = STATUS_COPY[state];

  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", dotClassName)} />
      {label}
    </p>
  );
}
