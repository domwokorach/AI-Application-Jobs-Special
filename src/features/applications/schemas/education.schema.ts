import { z } from "zod";

export const educationEntrySchema = z.object({
  institution: z.string().min(1, "Enter an institution."),
  qualification: z.string().min(1, "Enter a qualification."),
  subject: z.string().optional(),
  grade: z.string().optional(),
});

export const educationSchema = z.object({
  education: z.array(educationEntrySchema),
});

export type EducationValues = z.infer<typeof educationSchema>;
