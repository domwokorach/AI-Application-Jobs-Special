"use client";

import { cn } from "cn";
import { ArrowUp } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/mocks/chat/mock-chat-responses";

const COUNTER_VISIBLE_THRESHOLD = CHAT_MESSAGE_MAX_LENGTH - 100;
const MAX_TEXTAREA_HEIGHT_PX = 112;

export function ChatInput({ disabled, onSend }: { disabled?: boolean; onSend: (content: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = value.trim();
  const canSend = !disabled && trimmed.length > 0;

  const resize = (element: HTMLTextAreaElement) => {
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  };

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="shrink-0 border-t bg-card px-3 py-3">
      <div className="flex items-end gap-2 rounded-lg border border-input bg-background px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50">
        <label className="sr-only" htmlFor="chat-message-input">
          Type a message
        </label>
        <textarea
          className="max-h-28 min-h-6 flex-1 resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          id="chat-message-input"
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          onChange={(event) => {
            setValue(event.target.value);
            resize(event.target);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message…"
          ref={textareaRef}
          rows={1}
          value={value}
        />
        <Button aria-label="Send message" className="shrink-0" disabled={!canSend} onClick={submit} size="icon-sm" type="button">
          <ArrowUp className="size-4" />
        </Button>
      </div>
      <p className={cn("mt-1 px-1 text-right text-[11px] text-muted-foreground", value.length < COUNTER_VISIBLE_THRESHOLD && "sr-only")}>
        {value.length}/{CHAT_MESSAGE_MAX_LENGTH}
      </p>
    </div>
  );
}
