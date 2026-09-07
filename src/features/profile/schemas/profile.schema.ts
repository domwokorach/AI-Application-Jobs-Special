import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().min(2, "Enter your full name."),
  preferredName: z.string().optional(),
  email: z.string().email("Enter a valid email address."),
  mobile: z.string().optional(),
});

export type ProfileValues = z.infer<typeof profileSchema>;
