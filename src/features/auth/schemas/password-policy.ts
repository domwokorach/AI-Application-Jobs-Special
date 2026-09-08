import { z } from "zod";

/**
 * The single authoritative password policy, shared by Create Account, Reset Password and
 * Change Password. Never define a second, differing policy anywhere else — the requirements
 * shown to the candidate must always match what the server actually enforces.
 */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

export const passwordRequirements: string[] = [
  `At least ${PASSWORD_MIN_LENGTH} characters`,
];

export const passwordSchema = z
  .string()
  .min(1, "Enter a password.")
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`)
  .max(PASSWORD_MAX_LENGTH, "That password is too long.");
