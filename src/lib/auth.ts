import "server-only";
import { requireAuth } from "@/lib/auth/authorization";
import { findAccountById } from "@/features/auth/services/accounts.service";
import type { UserRole } from "@/types";

export type RecruitmentRole = "recruitment" | "hiring-manager" | "hr";
export type SensitiveDocumentType = "APPLICATION" | "CV" | "COVER_LETTER";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role?: RecruitmentRole;
  sessionExpiresAt?: string;
  documentPermissions?: ReadonlyArray<{
    applicationId: string;
    documentTypes: readonly SensitiveDocumentType[];
  }>;
};

const ALL_DOCUMENT_TYPES: readonly SensitiveDocumentType[] = ["APPLICATION", "CV", "COVER_LETTER"];

function toRecruitmentRole(role: UserRole): RecruitmentRole | undefined {
  switch (role) {
    case "RECRUITMENT":
      return "recruitment";
    case "HIRING_MANAGER":
      return "hiring-manager";
    // ADMIN is treated as the broadest recruitment-side tier (same document policy as HR) —
    // there is no separate "admin" confidentiality tier in the privacy model.
    case "HR":
    case "ADMIN":
      return "hr";
    case "CANDIDATE":
      return undefined;
  }
}

/**
 * Bridges the general JWT-based `requireAuth()` into the recruitment-side privacy/authorization
 * model (`features/privacy/services/privacy.service.ts`), which predates and is more granular
 * than plain role checks: it authorizes per-application, per-document-type. This app has no real
 * submitted-application store to derive genuine per-application grants from (every submission is
 * the single mock "demo-application" record — see applications.service.ts), so a recruitment-side
 * role is granted access to every document type on that one demo record. A production deployment
 * with real submitted applications would replace `documentPermissions` here with a genuine
 * per-application assignment/ownership lookup.
 *
 * Throws only when there is no authenticated session at all (guest) — an authenticated candidate
 * is returned with `role: undefined`, which the privacy service already treats as "forbidden"
 * rather than "please sign in".
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const auth = await requireAuth();
  const account = await findAccountById(auth.userId);
  if (!account) throw new Error("Authentication is required.");

  const role = toRecruitmentRole(account.role);

  return {
    id: account.id,
    email: account.email,
    role,
    documentPermissions: role ? [{ applicationId: "demo-application", documentTypes: ALL_DOCUMENT_TYPES }] : undefined,
  };
}
