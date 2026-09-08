export type MockChatIntent =
  | "TRACK_APPLICATION"
  | "CONTINUE_APPLICATION"
  | "CV_HELP"
  | "PASSWORD_RESET"
  | "REASONABLE_ADJUSTMENTS"
  | "GENERAL_HELP"
  | "UNKNOWN";

const INTENT_PATTERNS: Array<{ intent: MockChatIntent; patterns: RegExp[] }> = [
  { intent: "TRACK_APPLICATION", patterns: [/track/i, /\bstatus\b/i, /progress/i, /where.*application/i] },
  { intent: "CONTINUE_APPLICATION", patterns: [/continue/i, /\bdraft\b/i, /finish.*application/i, /resume/i] },
  { intent: "CV_HELP", patterns: [/\bcv\b/i, /r[ée]sum[ée]/i, /upload/i, /\bdocument\b/i] },
  { intent: "PASSWORD_RESET", patterns: [/password/i, /forgot/i, /\breset\b/i, /log ?in/i, /sign ?in/i, /locked out/i] },
  { intent: "REASONABLE_ADJUSTMENTS", patterns: [/adjustment/i, /accessib/i, /\bdisab/i] },
  { intent: "GENERAL_HELP", patterns: [/\bhelp\b/i, /^hi$/i, /^hello$/i, /what can you/i] },
];

/**
 * This is a deterministic keyword matcher, not an LLM — it must never fabricate an answer for
 * text it doesn't recognise. Anything that doesn't match a known pattern falls through to
 * "UNKNOWN", which the mock server maps to the fixed "I'm not sure how to help with that yet" reply.
 */
export function matchIntent(rawContent: string): MockChatIntent {
  const content = rawContent.trim();
  if (!content) return "UNKNOWN";

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((pattern) => pattern.test(content))) return intent;
  }

  return "UNKNOWN";
}
