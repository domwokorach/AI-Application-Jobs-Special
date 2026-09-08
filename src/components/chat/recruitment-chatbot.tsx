"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { ChatPanel } from "@/components/chat/chat-panel";
import { useChatSocket } from "@/hooks/use-chat-socket";
import type { ChatWindowState } from "@/lib/socket/types";

/**
 * Fixed bottom-right floating widget, mounted once for the whole portal. The socket connection
 * (`useChatSocket`) is owned here, above open/close state, so minimising or closing the panel
 * never tears down the connection or drops in-memory chat history — only unmounting this
 * component does (see useChatSocket's session-only history note).
 */
export function RecruitmentChatbot() {
  const pathname = usePathname();
  const [windowState, setWindowState] = useState<ChatWindowState>("CLOSED");
  const [unreadCount, setUnreadCount] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const seenMessageCount = useRef(0);

  const chat = useChatSocket();
  const shouldFocusLauncherRef = useRef(false);

  // The launcher unmounts while the panel is open, so it isn't in the DOM yet when close()/
  // minimise() run — focus it once it remounts, via an effect that fires after that commit.
  useEffect(() => {
    if (windowState !== "OPEN" && shouldFocusLauncherRef.current) {
      shouldFocusLauncherRef.current = false;
      launcherRef.current?.focus();
    }
  }, [windowState]);

  useEffect(() => {
    const newMessages = chat.messages.slice(seenMessageCount.current);
    seenMessageCount.current = chat.messages.length;

    if (windowState === "OPEN") return;

    const newAssistantMessages = newMessages.filter((message) => message.role === "ASSISTANT").length;
    if (newAssistantMessages > 0) {
      setUnreadCount((count) => count + newAssistantMessages);
    }
  }, [chat.messages, windowState]);

  const open = () => {
    setWindowState("OPEN");
    setUnreadCount(0);
  };

  const close = () => {
    setWindowState("CLOSED");
    shouldFocusLauncherRef.current = true;
  };

  const minimise = () => {
    setWindowState("MINIMISED");
    shouldFocusLauncherRef.current = true;
  };

  if (windowState === "OPEN") {
    return <ChatPanel chat={chat} isApplicationFlow={pathname.startsWith("/applications/")} onClose={close} onMinimise={minimise} />;
  }

  return <ChatLauncher isApplicationFlow={pathname.startsWith("/applications/")} onOpen={open} ref={launcherRef} unreadCount={unreadCount} />;
}
