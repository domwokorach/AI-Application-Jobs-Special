import { z } from "zod";

export const adjustmentsSchema = z.object({
  adjustments: z.enum(["yes", "no", "discuss"]).optional(),
  adjustmentDetails: z.string().optional(),
});

export type AdjustmentsValues = z.infer<typeof adjustmentsSchema>;
