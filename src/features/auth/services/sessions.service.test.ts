import { describe, expect, it } from "vitest";
import { createAuthSession, rotateAuthSession, validateRefreshToken } from "@/features/auth/services/sessions.service";

describe("refresh session rotation", () => {
  it("rotates a valid refresh token exactly once", async () => {
    const { refreshToken } = await createAuthSession("acct_1");

    const rotated = rotateAuthSession(refreshToken);
    expect(rotated.outcome).toBe("rotated");

    // The original token must no longer validate after rotation.
    const revalidated = validateRefreshToken(refreshToken);
    expect(revalidated).toEqual({ valid: false, reason: "revoked" });
  });

  it("detects reuse of an already-rotated token and revokes the whole account", async () => {
    const { refreshToken } = await createAuthSession("acct_2");
    const first = rotateAuthSession(refreshToken);
    expect(first.outcome).toBe("rotated");
    if (first.outcome !== "rotated") return;

    // Replay the original (now-revoked) token — this must be reported distinctly and the new
    // session issued by the rotation must also stop working.
    const replay = rotateAuthSession(refreshToken);
    expect(replay.outcome).toBe("reuse-detected");

    const newTokenAfterReuse = validateRefreshToken(first.refreshToken);
    expect(newTokenAfterReuse.valid).toBe(false);
  });

  it("rejects a malformed token", () => {
    const result = validateRefreshToken("not-a-real-token");
    expect(result).toEqual({ valid: false, reason: "malformed" });
  });

  it("rejects a token with a mismatched secret for a real session id", async () => {
    const { refreshToken } = await createAuthSession("acct_3");
    const [sessionId] = refreshToken.split(".");
    const forged = `${sessionId}.not-the-real-secret`;
    const result = validateRefreshToken(forged);
    expect(result).toEqual({ valid: false, reason: "not-found" });
  });
});
