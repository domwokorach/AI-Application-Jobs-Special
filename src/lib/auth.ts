export type AuthenticatedUser = { id: string; email: string };

export async function requireUser(): Promise<AuthenticatedUser> {
  throw new Error("Authentication is not configured. Add an auth provider before enabling protected routes.");
}
