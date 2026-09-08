import { Bot } from "lucide-react";

/**
 * Fixed height so the message list doesn't jump when this mounts/unmounts. The three dots are a
 * purely visual affordance — screen readers get a single static label instead, so nothing is
 * announced on a loop while the dots animate (see AGENTS §51).
 */
export function ChatTypingIndicator() {
  return (
    <div className="flex h-8 min-w-0 items-center gap-2" role="status">
      <div className="grid size-8 shrink-0 place-items-center rounded-full bg-muted">
        <Bot aria-hidden className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-1 rounded-xl border border-transparent bg-muted px-3 py-2">
        <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.3s]" />
        <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce [animation-delay:-0.15s]" />
        <span aria-hidden className="size-1.5 rounded-full bg-muted-foreground/60 motion-safe:animate-bounce" />
      </div>
      <span className="sr-only">Application Assistant is responding…</span>
    </div>
  );
}
