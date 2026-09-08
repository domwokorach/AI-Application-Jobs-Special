/** Centralised Socket.IO-style event names — components/hooks/transports must reference these
 *  constants rather than scattering "chat:message" string literals. */
export const CHAT_CLIENT_EVENTS = {
  join: "chat:join",
  message: "chat:message",
  typing: "chat:typing",
} as const;

export const CHAT_SERVER_EVENTS = {
  connected: "chat:connected",
  message: "chat:message",
  messageAck: "chat:message:ack",
  typing: "chat:typing",
  error: "chat:error",
} as const;
