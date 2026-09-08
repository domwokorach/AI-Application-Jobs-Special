"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHAT_CLIENT_EVENTS, CHAT_SERVER_EVENTS } from "@/lib/socket/events";
import { createChatTransport, type ChatTransport } from "@/lib/socket/client";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/mocks/chat/mock-chat-responses";
import type { MockChatIntent } from "@/mocks/chat/mock-chat-intents";
import type { ChatConnectionState, ChatMessage, ChatMessageStatus } from "@/lib/socket/types";

export interface UseChatSocketResult {
  connectionState: ChatConnectionState;
  connected: boolean;
  connecting: boolean;
  messages: ChatMessage[];
  typing: boolean;
  lastError: string | undefined;
  sendMessage: (content: string, intent?: MockChatIntent) => void;
  retryMessage: (messageId: string) => void;
  reconnect: () => void;
}

function pendingUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "USER",
    content,
    createdAt: new Date().toISOString(),
    status: "SENDING",
  };
}

/**
 * Owns exactly one transport connection for the lifetime of the mounted chat widget — created
 * once on mount, torn down on unmount, never re-created on re-render. Chat history is
 * session-only: it lives in this hook's state and is discarded when the widget unmounts, never
 * written to storage.
 */
export function useChatSocket(): UseChatSocketResult {
  const [connectionState, setConnectionState] = useState<ChatConnectionState>("CONNECTING");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [lastError, setLastError] = useState<string>();

  const transportRef = useRef<ChatTransport>(undefined);
  const pendingContentRef = useRef(new Map<string, string>());

  const connect = useCallback(() => {
    setConnectionState((current) => (current === "OFFLINE" || current === "CONNECTING" ? "CONNECTING" : "RECONNECTING"));
    transportRef.current?.connect();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const onConnected = () => {
      if (cancelled) return;
      setConnectionState("ONLINE");
    };

    const onMessage = (message: ChatMessage) => {
      if (cancelled) return;
      setMessages((current) => [...current, message]);
    };

    const onMessageAck = ({ clientMessageId, status }: { clientMessageId: string; status: ChatMessageStatus }) => {
      if (cancelled) return;
      setMessages((current) => current.map((message) => (message.id === clientMessageId ? { ...message, status } : message)));
    };

    const onTyping = ({ isTyping }: { isTyping: boolean }) => {
      if (cancelled) return;
      setTyping(isTyping);
    };

    const onError = (error: { message: string }) => {
      if (cancelled) return;
      setLastError(error.message);
    };

    createChatTransport().then((transport) => {
      if (cancelled) return;

      if (!transport) {
        setConnectionState("OFFLINE");
        return;
      }

      transportRef.current = transport;
      transport.on(CHAT_SERVER_EVENTS.connected, onConnected);
      transport.on(CHAT_SERVER_EVENTS.message, onMessage);
      transport.on(CHAT_SERVER_EVENTS.messageAck, onMessageAck);
      transport.on(CHAT_SERVER_EVENTS.typing, onTyping);
      transport.on(CHAT_SERVER_EVENTS.error, onError);
      transport.connect();
    });

    return () => {
      cancelled = true;
      const transport = transportRef.current;
      if (!transport) return;
      transport.off(CHAT_SERVER_EVENTS.connected, onConnected);
      transport.off(CHAT_SERVER_EVENTS.message, onMessage);
      transport.off(CHAT_SERVER_EVENTS.messageAck, onMessageAck);
      transport.off(CHAT_SERVER_EVENTS.typing, onTyping);
      transport.off(CHAT_SERVER_EVENTS.error, onError);
      transport.disconnect();
      transportRef.current = undefined;
    };
  }, []);

  const dispatchMessage = useCallback((message: ChatMessage, intent?: MockChatIntent) => {
    const transport = transportRef.current;
    if (!transport) {
      setMessages((current) => current.map((entry) => (entry.id === message.id ? { ...entry, status: "FAILED" } : entry)));
      return;
    }

    pendingContentRef.current.set(message.id, message.content);
    transport.emit(CHAT_CLIENT_EVENTS.message, { clientMessageId: message.id, content: message.content, intent });
  }, []);

  const sendMessage = useCallback(
    (content: string, intent?: MockChatIntent) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const message = pendingUserMessage(trimmed.slice(0, CHAT_MESSAGE_MAX_LENGTH));
      setMessages((current) => [...current, message]);
      setLastError(undefined);
      dispatchMessage(message, intent);
    },
    [dispatchMessage],
  );

  const retryMessage = useCallback(
    (messageId: string) => {
      const content = pendingContentRef.current.get(messageId);
      if (!content) return;

      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: "SENDING" } : message)));
      setLastError(undefined);
      dispatchMessage({ id: messageId, role: "USER", content, createdAt: new Date().toISOString(), status: "SENDING" });
    },
    [dispatchMessage],
  );

  return {
    connectionState,
    connected: connectionState === "ONLINE",
    connecting: connectionState === "CONNECTING" || connectionState === "RECONNECTING",
    messages,
    typing,
    lastError,
    sendMessage,
    retryMessage,
    reconnect: connect,
  };
}
