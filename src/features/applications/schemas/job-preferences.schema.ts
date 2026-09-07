import { z } from "zod";

export const jobPreferencesSchema = z.object({
  role: z.string().min(1, "Select the role you are applying for."),
  location: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "temporary"]).optional(),
  availableFrom: z.string().optional(),
});

export type JobPreferencesValues = z.infer<typeof jobPreferencesSchema>;
