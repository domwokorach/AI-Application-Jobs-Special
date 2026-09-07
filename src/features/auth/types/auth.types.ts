export type AuthSession = { userId: string; email: string };

export type AuthActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string[] | undefined> };
