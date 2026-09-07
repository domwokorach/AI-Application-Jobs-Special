import { z } from "zod";

export const jobPreferencesSchema = z.object({
  role: z.string().min(1, "Select the role you are applying for."),
  location: z.string().optional(),
  preferredEmployer: z.string().optional(),
  employmentType: z.enum(["Permanent", "Full-time", "Part-time", "Fixed-term Contract", "Temporary", "Contract", "Internship", "Apprenticeship", "Graduate Scheme", "Other"]).optional(),
  availableFrom: z.string().optional(),
});

export type JobPreferencesValues = z.infer<typeof jobPreferencesSchema>;
