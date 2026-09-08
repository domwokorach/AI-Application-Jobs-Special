"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "@/components/chat/chat-header";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { CHAT_GREETING, CHAT_PRIVACY_NOTICE, QUICK_REPLIES } from "@/mocks/chat/mock-chat-responses";
import type { ChatMessage, ChatQuickReply } from "@/lib/socket/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "ASSISTANT",
  content: `${CHAT_GREETING}\n\n${CHAT_PRIVACY_NOTICE}`,
  createdAt: new Date(0).toISOString(),
  status: "DELIVERED",
  quickReplies: QUICK_REPLIES,
};

export function ChatPanel({
  chat,
  onMinimise,
  onClose,
}: {
  chat: ReturnType<typeof useChatSocket>;
  onMinimise: () => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const { connectionState, messages, typing, lastError, sendMessage, retryMessage, reconnect } = chat;

  const allMessages = useMemo(() => [WELCOME_MESSAGE, ...messages], [messages]);
  const offline = connectionState === "OFFLINE";

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleQuickReply = (quickReply: ChatQuickReply) => sendMessage(quickReply.label, quickReply.intent);

  return (
    <div
      aria-labelledby={titleId}
      aria-modal="false"
      className="fixed inset-x-3 bottom-3 top-[calc(1rem+env(safe-area-inset-top))] z-50 flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg outline-none sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:h-[min(600px,calc(100dvh-3rem))] sm:w-[min(390px,calc(100vw-3rem))]"
      ref={panelRef}
      role="dialog"
      tabIndex={-1}
    >
      <ChatHeader connectionState={connectionState} onClose={onClose} onMinimise={onMinimise} titleId={titleId} />

      {offline ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <TriangleAlert aria-hidden className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium text-card-foreground">
            We&apos;re having trouble connecting to the application assistant.
          </p>
          <p className="text-sm text-muted-foreground">You can continue using the recruitment portal.</p>
          <Button onClick={reconnect} size="sm" type="button" variant="outline">
            <RefreshCw className="size-3.5" />
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {lastError && (
            <p className="shrink-0 border-b bg-destructive/10 px-4 py-2 text-xs text-destructive" role="alert">
              {lastError}
            </p>
          )}
          <ChatMessageList
            messages={allMessages}
            onQuickReply={handleQuickReply}
            onRetry={retryMessage}
            quickRepliesDisabled={connectionState !== "ONLINE"}
            typing={typing}
          />
          <ChatInput disabled={connectionState !== "ONLINE"} onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
