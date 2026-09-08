import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm."),
  confirm: z
    .string()
    .min(1, 'Type "DELETE" to confirm.')
    .refine((value: string): boolean => value === "DELETE", { message: 'Type "DELETE" to confirm.' }),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
