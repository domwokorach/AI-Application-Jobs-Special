import { z } from "zod";
import { passwordSchema } from "@/features/auth/schemas/password-policy";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: "The passwords do not match.",
    path: ["confirmNewPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "Your new password must be different from your current password.",
    path: ["newPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
