"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageGroup } from "@/components/ui/message";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatTypingIndicator } from "@/components/chat/chat-typing-indicator";
import type { ChatMessage as ChatMessageData, ChatQuickReply } from "@/lib/socket/types";

const NEAR_BOTTOM_THRESHOLD_PX = 80;

export function ChatMessageList({
  messages,
  typing,
  onRetry,
  onQuickReply,
  quickRepliesDisabled,
}: {
  messages: ChatMessageData[];
  typing: boolean;
  onRetry: (messageId: string) => void;
  onQuickReply: (quickReply: ChatQuickReply) => void;
  quickRepliesDisabled?: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    // Only auto-scroll when the candidate hasn't deliberately scrolled up to read earlier
    // messages — forcing them back down mid-read would be disorienting (see AGENTS §49).
    if (isNearBottom) {
      viewport.scrollTo({ top: viewport.scrollHeight });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typing]);

  const handleScroll = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const distanceFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setIsNearBottom(distanceFromBottom <= NEAR_BOTTOM_THRESHOLD_PX);
  };

  const scrollToBottom = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    setIsNearBottom(true);
  };

  return (
    <div className="relative min-h-0 flex-1">
      <div
        aria-live="polite"
        className="h-full min-h-0 overflow-y-auto overscroll-contain px-4 py-4"
        onScroll={handleScroll}
        ref={viewportRef}
        role="log"
      >
        <MessageGroup className="gap-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onQuickReply={onQuickReply}
              onRetry={onRetry}
              quickRepliesDisabled={quickRepliesDisabled}
            />
          ))}
          {typing && <ChatTypingIndicator />}
        </MessageGroup>
      </div>

      {!isNearBottom && (
        <Button
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          onClick={scrollToBottom}
          size="sm"
          type="button"
          variant="secondary"
        >
          <ArrowDown className="size-3.5" />
          New message
        </Button>
      )}
    </div>
  );
}
