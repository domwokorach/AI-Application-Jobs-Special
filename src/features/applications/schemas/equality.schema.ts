import { z } from "zod";

export const equalitySchema = z.object({
  ageGroup: z.string().optional(),
  sex: z.string().optional(),
  genderIdentity: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  sexualOrientation: z.string().optional(),
});

export type EqualityValues = z.infer<typeof equalitySchema>;
