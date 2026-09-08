import { CHAT_SERVER_EVENTS } from "@/lib/socket/events";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/socket/types";
import { resolveMockChatReply, shouldSimulateSendFailure } from "@/mocks/chat/mock-chat-server";

export type ChatTransportMode = "mock" | "websocket" | "disabled";

/**
 * Transport abstraction the rest of the chat UI depends on. `useChatSocket` never touches
 * `MockChatTransport` or `socket.io-client` directly — only this shape — so the mock can be
 * swapped for a real transport later without rewriting any component or hook.
 */
export interface ChatTransport {
  connect(): void;
  disconnect(): void;
  on<K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]): void;
  off<K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]): void;
  emit<K extends keyof ClientToServerEvents>(event: K, payload: Parameters<ClientToServerEvents[K]>[0]): void;
}

type Listener = (...args: unknown[]) => void;

const MOCK_CONNECT_DELAY_MS = 400;

/**
 * Simulates a Socket.IO connection entirely in the browser: no network call, no server process.
 * It talks to `resolveMockChatReply`, which is where a real deployment would instead be handled
 * server-side (see `createWebSocketTransport` below and AGENTS §61 — a long-running Socket.IO
 * server doesn't fit every serverless Next.js deployment target, so production should pick
 * infrastructure that genuinely supports persistent connections, e.g. Vercel Functions WebSockets).
 */
class MockChatTransport implements ChatTransport {
  private listeners = new Map<string, Set<Listener>>();
  private connectTimer?: ReturnType<typeof setTimeout>;

  connect(): void {
    clearTimeout(this.connectTimer);
    this.connectTimer = setTimeout(() => {
      this.dispatch(CHAT_SERVER_EVENTS.connected, { sessionId: crypto.randomUUID() });
    }, MOCK_CONNECT_DELAY_MS);
  }

  disconnect(): void {
    clearTimeout(this.connectTimer);
  }

  on<K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler as Listener);
  }

  off<K extends keyof ServerToClientEvents>(event: K, handler: ServerToClientEvents[K]): void {
    this.listeners.get(event)?.delete(handler as Listener);
  }

  emit<K extends keyof ClientToServerEvents>(event: K, payload: Parameters<ClientToServerEvents[K]>[0]): void {
    if (event === "chat:message") {
      void this.handleClientMessage(payload as Parameters<ClientToServerEvents["chat:message"]>[0]);
    }
    // "chat:join" and "chat:typing" (candidate-side typing) have nothing for this mock to react to.
  }

  private async handleClientMessage(payload: Parameters<ClientToServerEvents["chat:message"]>[0]): Promise<void> {
    if (shouldSimulateSendFailure(payload.content)) {
      this.dispatch(CHAT_SERVER_EVENTS.messageAck, { clientMessageId: payload.clientMessageId, status: "FAILED" });
      this.dispatch(CHAT_SERVER_EVENTS.error, { code: "SEND_FAILED", message: "Message couldn't be sent." });
      return;
    }

    this.dispatch(CHAT_SERVER_EVENTS.messageAck, { clientMessageId: payload.clientMessageId, status: "SENT" });
    this.dispatch(CHAT_SERVER_EVENTS.typing, { isTyping: true });

    try {
      const replies = await resolveMockChatReply(payload.content, payload.intent);
      this.dispatch(CHAT_SERVER_EVENTS.typing, { isTyping: false });
      for (const reply of replies) {
        this.dispatch(CHAT_SERVER_EVENTS.message, reply);
      }
    } catch {
      this.dispatch(CHAT_SERVER_EVENTS.typing, { isTyping: false });
      this.dispatch(CHAT_SERVER_EVENTS.error, {
        code: "ASSISTANT_UNAVAILABLE",
        message: "We're having trouble connecting to the application assistant.",
      });
    }
  }

  private dispatch<K extends keyof ServerToClientEvents>(event: K, payload: Parameters<ServerToClientEvents[K]>[0]): void {
    this.listeners.get(event)?.forEach((handler) => handler(payload));
  }
}

/**
 * Production replacement for the mock transport. Not wired up by default (no chat server is
 * deployed with this app) — kept here, using the real `socket.io-client` package, as the concrete
 * example of what plugging in a genuine WebSocket/Socket.IO backend looks like once one exists.
 */
async function createWebSocketTransport(url: string): Promise<ChatTransport> {
  const { io } = await import("socket.io-client");
  const socket: import("socket.io-client").Socket<ServerToClientEvents, ClientToServerEvents> = io(url, {
    autoConnect: false,
    transports: ["websocket"],
  });

  // socket.io-client's own overloads resolve per-call, not against a generic `K` held across an
  // object literal — `untypedSocket` bridges that gap; `socket` above stays fully typed for
  // anyone reading/extending this adapter.
  const untypedSocket = socket as unknown as {
    on(event: string, handler: (...args: unknown[]) => void): void;
    off(event: string, handler: (...args: unknown[]) => void): void;
    emit(event: string, payload: unknown): void;
  };

  return {
    connect: () => socket.connect(),
    disconnect: () => socket.disconnect(),
    on: (event, handler) => untypedSocket.on(event, handler as (...args: unknown[]) => void),
    off: (event, handler) => untypedSocket.off(event, handler as (...args: unknown[]) => void),
    emit: (event, payload) => untypedSocket.emit(event, payload),
  };
}

export function getChatTransportMode(): ChatTransportMode {
  const mode = process.env.NEXT_PUBLIC_CHAT_MODE;
  if (mode === "websocket" || mode === "disabled") return mode;
  return "mock";
}

export async function createChatTransport(): Promise<ChatTransport | undefined> {
  const mode = getChatTransportMode();

  if (mode === "disabled") return undefined;
  if (mode === "websocket") {
    const url = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;
    if (!url) return undefined;
    return createWebSocketTransport(url);
  }

  return new MockChatTransport();
}
