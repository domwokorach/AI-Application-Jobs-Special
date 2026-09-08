import { Button } from "@/components/ui/button";
import type { ChatQuickReply } from "@/lib/socket/types";

export function ChatQuickReplies({
  quickReplies,
  disabled,
  onSelect,
}: {
  quickReplies: ChatQuickReply[];
  disabled?: boolean;
  onSelect: (quickReply: ChatQuickReply) => void;
}) {
  if (quickReplies.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {quickReplies.map((quickReply) => (
        <Button
          className="h-auto min-h-8 max-w-full rounded-full px-3 py-1.5 text-xs whitespace-normal"
          disabled={disabled}
          key={quickReply.id}
          onClick={() => onSelect(quickReply)}
          size="sm"
          type="button"
          variant="outline"
        >
          {quickReply.label}
        </Button>
      ))}
    </div>
  );
}
