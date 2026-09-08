import type { MockChatIntent } from "@/mocks/chat/mock-chat-intents";

export type ChatMessageRole = "USER" | "ASSISTANT" | "SYSTEM";

export type ChatMessageStatus = "SENDING" | "SENT" | "DELIVERED" | "FAILED";

export type ChatConnectionState = "CONNECTING" | "ONLINE" | "RECONNECTING" | "OFFLINE";

export type ChatWindowState = "CLOSED" | "OPEN" | "MINIMISED";

/** A navigation shortcut rendered as a button under an assistant message (e.g. "Track Application"). */
export interface ChatAction {
  label: string;
  href: string;
}

/** An interactive suggestion rendered under an assistant message (e.g. "Track my application"). */
export interface ChatQuickReply {
  id: string;
  label: string;
  intent?: MockChatIntent;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  status?: ChatMessageStatus;
  actions?: ChatAction[];
  quickReplies?: ChatQuickReply[];
}

export interface ChatJoinPayload {
  sessionId: string;
}

export interface SendMessagePayload {
  clientMessageId: string;
  content: string;
  /** Set when the message originated from a quick-reply tap, so the mock server can resolve the
   *  intent deterministically instead of re-parsing the label text. */
  intent?: MockChatIntent;
}

export interface TypingPayload {
  isTyping: boolean;
}

export interface ChatConnectedPayload {
  sessionId: string;
}

export interface ChatError {
  code: string;
  message: string;
}

export interface ClientToServerEvents {
  "chat:join": (payload: ChatJoinPayload) => void;
  "chat:message": (payload: SendMessagePayload) => void;
  "chat:typing": (payload: TypingPayload) => void;
}

export interface ServerToClientEvents {
  "chat:connected": (payload: ChatConnectedPayload) => void;
  "chat:message": (message: ChatMessage) => void;
  "chat:message:ack": (payload: { clientMessageId: string; status: ChatMessageStatus }) => void;
  "chat:typing": (payload: TypingPayload) => void;
  "chat:error": (error: ChatError) => void;
}
