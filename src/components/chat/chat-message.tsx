import Link from "next/link";
import { Bot, TriangleAlert, User } from "lucide-react";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Button } from "@/components/ui/button";
import { Message, MessageAvatar, MessageContent, MessageFooter } from "@/components/ui/message";
import { ChatQuickReplies } from "@/components/chat/chat-quick-replies";
import type { ChatMessage as ChatMessageData, ChatQuickReply } from "@/lib/socket/types";

export function ChatMessage({
  message,
  onRetry,
  onQuickReply,
  quickRepliesDisabled,
}: {
  message: ChatMessageData;
  onRetry: (messageId: string) => void;
  onQuickReply: (quickReply: ChatQuickReply) => void;
  quickRepliesDisabled?: boolean;
}) {
  const isUser = message.role === "USER";
  const failed = message.status === "FAILED";

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageAvatar aria-hidden>
        {isUser ? <User className="size-4 text-muted-foreground" /> : <Bot className="size-4 text-muted-foreground" />}
      </MessageAvatar>
      <MessageContent className="max-w-[85%]">
        <Bubble align={isUser ? "end" : "start"} variant={isUser ? "default" : "tinted"}>
          <BubbleContent className="min-w-0 break-words whitespace-pre-wrap">{message.content}</BubbleContent>
        </Bubble>

        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 self-start">
            {message.actions.map((action) => (
              <Button asChild key={action.href} size="sm" variant="outline">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ))}
          </div>
        )}

        {message.quickReplies && message.quickReplies.length > 0 && (
          <ChatQuickReplies disabled={quickRepliesDisabled} onSelect={onQuickReply} quickReplies={message.quickReplies} />
        )}

        {isUser && message.status && message.status !== "SENT" && message.status !== "DELIVERED" && (
          <MessageFooter className="gap-1.5">
            {message.status === "SENDING" && <span>Sending…</span>}
            {failed && (
              <span className="flex items-center gap-1.5 text-destructive">
                <TriangleAlert aria-hidden className="size-3.5" />
                Message couldn&apos;t be sent.
                <Button className="h-auto p-0 text-destructive underline" onClick={() => onRetry(message.id)} size="xs" variant="link">
                  Retry
                </Button>
              </span>
            )}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
