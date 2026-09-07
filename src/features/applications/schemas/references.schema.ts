import { z } from "zod";

export const referenceEntrySchema = z.object({
  name: z.string().min(1, "Enter a reference name."),
  organisation: z.string().optional(),
  email: z.string().email("Enter a valid email address.").or(z.literal("")),
  telephone: z.string().optional(),
});

export const referencesSchema = z.object({
  references: z.array(referenceEntrySchema),
});

export type ReferencesValues = z.infer<typeof referencesSchema>;
