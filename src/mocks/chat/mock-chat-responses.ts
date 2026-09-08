import { defaultAcceptedTypes, defaultMaxSizeBytes } from "@/hooks/use-file-upload";
import type { ChatAction, ChatQuickReply } from "@/lib/socket/types";
import type { MockChatIntent } from "@/mocks/chat/mock-chat-intents";

/** Simulated "assistant is thinking" delay, kept in one place rather than scattered setTimeouts. */
export const MOCK_CHAT_DELAY_MS = 600;
export const TYPING_DELAY_MS = 500;

export const CHAT_MESSAGE_MAX_LENGTH = 1000;

export const CHAT_PRIVACY_NOTICE =
  "For your privacy, don't share passwords or other sensitive authentication information in chat.";

export const CHAT_GREETING = "Hi! How can I help with your application today?";

export const QUICK_REPLIES: ChatQuickReply[] = [
  { id: "TRACK_APPLICATION", label: "Track my application", intent: "TRACK_APPLICATION" },
  { id: "CONTINUE_APPLICATION", label: "Continue an application", intent: "CONTINUE_APPLICATION" },
  { id: "CV_HELP", label: "Uploading my CV", intent: "CV_HELP" },
  { id: "PASSWORD_RESET", label: "Forgot my password", intent: "PASSWORD_RESET" },
  { id: "REASONABLE_ADJUSTMENTS", label: "Reasonable adjustments", intent: "REASONABLE_ADJUSTMENTS" },
];

export const UNKNOWN_REPLY_TEXT =
  "I'm not sure how to help with that yet.\n\nI can help with:\n\n• Tracking an application\n• Continuing an application\n• CV uploads\n• Password resets\n• Reasonable adjustments\n\nChoose an option below.";

export const GENERAL_HELP_REPLY_TEXT = "I can help with the following. Choose an option below, or type your question.";

export const PASSWORD_RESET_REPLY: { text: string; actions: ChatAction[] } = {
  text: "You can reset your password from the Forgot Password page.\n\nFor your security, never send your password, reset link or verification code in chat — I won't ask for it.",
  actions: [{ label: "Reset Password", href: "/forgot-password" }],
};

export const REASONABLE_ADJUSTMENTS_REPLY: { text: string; actions: ChatAction[] } = {
  text: "You can tell us about any adjustments you may need during the recruitment process in the Reasonable Adjustments & Accessibility section, rather than describing health or disability details here.",
  actions: [{ label: "Open Reasonable Adjustments", href: "/accessibility" }],
};

const cvSizeLabel = `${Math.round(defaultMaxSizeBytes / 1_000_000)}MB`;
const cvFormatsLabel = defaultAcceptedTypes
  .map((type) => (type.includes("pdf") ? "PDF" : type.includes("openxml") ? "DOCX" : "DOC"))
  .join(", ");

export const CV_HELP_REPLY: { text: string; actions: ChatAction[] } = {
  text: `You can upload your CV in ${cvFormatsLabel} format.\n\nCheck that the file is no larger than ${cvSizeLabel}.`,
  actions: [{ label: "Go to CV", href: "/applications" }],
};

export const NO_SUBMITTED_APPLICATIONS_REPLY: { text: string; actions: ChatAction[] } = {
  text: "You don't have any submitted applications yet. Once you submit an application, I can track its progress here.",
  actions: [{ label: "View Jobs", href: "/jobs" }],
};

export const NO_DRAFT_APPLICATIONS_REPLY: { text: string; actions: ChatAction[] } = {
  text: "You don't have any applications in progress right now.",
  actions: [{ label: "View Jobs", href: "/jobs" }],
};

export function replyForIntent(intent: MockChatIntent): { text: string; actions?: ChatAction[] } {
  switch (intent) {
    case "CV_HELP":
      return CV_HELP_REPLY;
    case "PASSWORD_RESET":
      return PASSWORD_RESET_REPLY;
    case "REASONABLE_ADJUSTMENTS":
      return REASONABLE_ADJUSTMENTS_REPLY;
    case "GENERAL_HELP":
      return { text: GENERAL_HELP_REPLY_TEXT };
    default:
      return { text: UNKNOWN_REPLY_TEXT };
  }
}
