import { z } from "zod";
import { passwordSchema } from "./password-policy";

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "This reset link is missing its token."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "The passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
