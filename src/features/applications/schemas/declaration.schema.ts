import { z } from "zod";

export const declarationSchema = z.object({
  declaration: z.boolean().refine(Boolean, "Please confirm the declaration before submitting."),
});

export type DeclarationValues = z.infer<typeof declarationSchema>;
