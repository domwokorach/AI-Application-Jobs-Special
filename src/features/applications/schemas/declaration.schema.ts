import { z } from "zod";

export const declarationSchema = z.object({
  declarationAccurate: z.boolean().refine(Boolean, "Confirm that the information provided is complete and accurate."),
  declarationEditRestriction: z
    .boolean()
    .refine(Boolean, "Confirm that you understand some information may not be editable after submitting."),
});

export type DeclarationValues = z.infer<typeof declarationSchema>;
