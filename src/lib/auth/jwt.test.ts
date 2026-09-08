import { describe, expect, it, vi } from "vitest";
import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";

describe("access token sign/verify", () => {
  it("round-trips a valid token", async () => {
    const token = await signAccessToken({ accountId: "acct_1", role: "CANDIDATE", sessionId: "sess_1" });
    const result = await verifyAccessToken(token);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.claims.sub).toBe("acct_1");
      expect(result.claims.role).toBe("CANDIDATE");
      expect(result.claims.sessionId).toBe("sess_1");
      expect(result.claims.typ).toBe("access");
    }
  });

  it("rejects a tampered token", async () => {
    const token = await signAccessToken({ accountId: "acct_1", role: "CANDIDATE", sessionId: "sess_1" });
    const tampered = `${token.slice(0, -4)}abcd`;
    const result = await verifyAccessToken(tampered);
    expect(result.valid).toBe(false);
  });

  it("rejects an expired token", async () => {
    vi.useFakeTimers();
    const token = await signAccessToken({ accountId: "acct_1", role: "CANDIDATE", sessionId: "sess_1" });
    vi.advanceTimersByTime(60 * 60 * 1000); // well past the 15-minute TTL
    const result = await verifyAccessToken(token);
    vi.useRealTimers();
    expect(result).toEqual({ valid: false, reason: "expired" });
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAccessToken({ accountId: "acct_1", role: "CANDIDATE", sessionId: "sess_1" });
    // Flip a character in the signature segment specifically (last dot-segment) to simulate a
    // token that was never actually signed with our key.
    const parts = token.split(".");
    parts[2] = parts[2].slice(0, -1) + (parts[2].at(-1) === "A" ? "B" : "A");
    const result = await verifyAccessToken(parts.join("."));
    expect(result.valid).toBe(false);
  });
});
