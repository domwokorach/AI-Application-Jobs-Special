import { z } from "zod";

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm."),
  confirm: z.string().refine((value) => value === "DELETE", { message: 'Type "DELETE" to confirm.' }),
});

export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
