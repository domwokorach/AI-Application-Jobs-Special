import { z } from "zod";

export const rightToWorkSchema = z.object({
  hasRightToWork: z.enum(["yes", "visa", "no"], { message: "Confirm your right to work status." }),
  requiresSponsorship: z.enum(["yes", "no"]).optional(),
});

export type RightToWorkValues = z.infer<typeof rightToWorkSchema>;
