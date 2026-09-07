import { z } from "zod";

const optionalAgeGroup = z.string().optional().superRefine((value, context) => {
  if (!value) return;

  if (!/^\d+$/.test(value)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a whole number." });
    return;
  }

  const age = Number(value);
  if (age < 18) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Age group must be 18 or over." });
  } else if (age > 99) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Age group must be 99 or under." });
  }
});

export const equalitySchema = z.object({
  ageGroup: optionalAgeGroup,
  sex: z.string().optional(),
  genderIdentity: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  sexualOrientation: z.string().optional(),
});

export type EqualityValues = z.infer<typeof equalitySchema>;
