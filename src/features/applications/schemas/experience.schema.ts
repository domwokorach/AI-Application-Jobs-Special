import { z } from "zod";

export const workExperienceSchema = z.object({
  title: z.string().min(1, "Enter a job title."),
  employer: z.string().min(1, "Enter an employer."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  responsibilities: z.string().optional(),
});

export const experienceSchema = z.object({
  work: z.array(workExperienceSchema),
});

export type ExperienceValues = z.infer<typeof experienceSchema>;
