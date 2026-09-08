import { forwardRef } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatLauncher = forwardRef<HTMLButtonElement, { unreadCount: number; onOpen: () => void }>(function ChatLauncher(
  { unreadCount, onOpen },
  ref,
) {
  return (
    <div className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="relative">
        <Button
          aria-haspopup="dialog"
          aria-label="Open application assistant"
          className="size-12 rounded-full shadow-lg"
          onClick={onOpen}
          ref={ref}
          size="icon"
          type="button"
        >
          <MessageCircle className="size-5" />
        </Button>
        {unreadCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1 -right-1 grid size-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-medium text-destructive-foreground ring-2 ring-background"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </div>
    </div>
  );
});
