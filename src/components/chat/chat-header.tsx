import { Bot, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatConnectionStatus } from "@/components/chat/chat-connection-status";
import type { ChatConnectionState } from "@/lib/socket/types";

export function ChatHeader({
  connectionState,
  titleId,
  onMinimise,
  onClose,
}: {
  connectionState: ChatConnectionState;
  titleId: string;
  onMinimise: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
          <Bot className="size-4.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-card-foreground" id={titleId}>
            Application Assistant
          </p>
          <ChatConnectionStatus state={connectionState} />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button aria-label="Minimise application assistant" onClick={onMinimise} size="icon-sm" type="button" variant="ghost">
          <Minus className="size-4" />
        </Button>
        <Button aria-label="Close application assistant" onClick={onClose} size="icon-sm" type="button" variant="ghost">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
