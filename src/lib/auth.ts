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

export async function requireUser(): Promise<AuthenticatedUser> {
  throw new Error("Authentication is not configured. Add an auth provider before enabling protected routes.");
}
