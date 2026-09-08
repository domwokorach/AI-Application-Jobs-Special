import { getChatApplicationsSummaryAction } from "@/features/chat/actions/chat.actions";
import type { ChatAction, ChatMessage } from "@/lib/socket/types";
import { matchIntent, type MockChatIntent } from "@/mocks/chat/mock-chat-intents";
import {
  MOCK_CHAT_DELAY_MS,
  NO_DRAFT_APPLICATIONS_REPLY,
  NO_SUBMITTED_APPLICATIONS_REPLY,
  QUICK_REPLIES,
  replyForIntent,
  TYPING_DELAY_MS,
} from "@/mocks/chat/mock-chat-responses";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assistantMessage(content: string, extra?: { actions?: ChatAction[]; quickReplies?: ChatMessage["quickReplies"] }): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "ASSISTANT",
    content,
    createdAt: new Date().toISOString(),
    status: "DELIVERED",
    actions: extra?.actions,
    quickReplies: extra?.quickReplies,
  };
}

/**
 * Candidate typing "force error" is a deliberate, documented way to exercise the send-failure /
 * retry UI on demand — this mock never fails randomly, since flaky demo behaviour is worse than
 * no failure state at all.
 */
export function shouldSimulateSendFailure(content: string): boolean {
  return content.trim().toLowerCase() === "force error";
}

async function trackApplicationReply(): Promise<ChatMessage[]> {
  const summary = await getChatApplicationsSummaryAction();

  if (summary.submitted.length === 0) {
    return [assistantMessage(NO_SUBMITTED_APPLICATIONS_REPLY.text, { actions: NO_SUBMITTED_APPLICATIONS_REPLY.actions })];
  }

  if (summary.submitted.length === 1) {
    const application = summary.submitted[0];
    return [
      assistantMessage(`Your ${application.jobTitle} application is currently at:\n\n${application.statusLabel}`, {
        actions: [{ label: "Track Application", href: `/applications/${application.id}/tracking` }],
      }),
    ];
  }

  return [
    assistantMessage(`You currently have ${summary.submitted.length} applications.`),
    ...summary.submitted.map((application) =>
      assistantMessage(`${application.jobTitle}\n${application.statusLabel}`, {
        actions: [{ label: "Track", href: `/applications/${application.id}/tracking` }],
      }),
    ),
  ];
}

async function continueApplicationReply(): Promise<ChatMessage[]> {
  const summary = await getChatApplicationsSummaryAction();

  if (summary.drafts.length === 0) {
    return [assistantMessage(NO_DRAFT_APPLICATIONS_REPLY.text, { actions: NO_DRAFT_APPLICATIONS_REPLY.actions })];
  }

  if (summary.drafts.length === 1) {
    const draft = summary.drafts[0];
    return [
      assistantMessage(`Your ${draft.jobTitle} application is currently ${draft.percentComplete}% complete.`, {
        actions: [{ label: "Continue Application", href: `/applications/${draft.id}/personal-details` }],
      }),
    ];
  }

  return [
    assistantMessage(`You have ${summary.drafts.length} applications in progress.`),
    ...summary.drafts.map((draft) =>
      assistantMessage(`${draft.jobTitle}\n${draft.percentComplete}% complete`, {
        actions: [{ label: "Continue", href: `/applications/${draft.id}/personal-details` }],
      }),
    ),
  ];
}

/**
 * Resolves a candidate message into one or more assistant `ChatMessage`s. This stands in for a
 * real Socket.IO server's message handler — it fetches data through the same server-authorized
 * application services the rest of the portal uses (see chat.actions.ts), so a candidate can
 * never see a status that wasn't fetched from the persisted mock backend.
 */
export async function resolveMockChatReply(content: string, explicitIntent?: MockChatIntent): Promise<ChatMessage[]> {
  const intent = explicitIntent ?? matchIntent(content);

  await delay(TYPING_DELAY_MS + MOCK_CHAT_DELAY_MS);

  switch (intent) {
    case "TRACK_APPLICATION":
      return trackApplicationReply();
    case "CONTINUE_APPLICATION":
      return continueApplicationReply();
    case "CV_HELP":
    case "PASSWORD_RESET":
    case "REASONABLE_ADJUSTMENTS": {
      const reply = replyForIntent(intent);
      return [assistantMessage(reply.text, { actions: reply.actions })];
    }
    case "GENERAL_HELP":
    case "UNKNOWN":
    default: {
      const reply = replyForIntent(intent);
      return [assistantMessage(reply.text, { quickReplies: QUICK_REPLIES })];
    }
  }
}
