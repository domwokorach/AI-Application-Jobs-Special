import { z } from "zod";
import { personalDetailsSchema } from "./personal-details.schema";
import { adjustmentsSchema } from "./adjustments.schema";
import { declarationSchema } from "./declaration.schema";
import { experienceSchema } from "./experience.schema";
import { educationSchema } from "./education.schema";
import { jobPreferencesSchema } from "./job-preferences.schema";
import { referencesSchema } from "./references.schema";

export { personalDetailsSchema };
export * from "./job-preferences.schema";
export * from "./right-to-work.schema";
export * from "./equality.schema";

export const applicationSchema = personalDetailsSchema
  .extend(jobPreferencesSchema.shape)
  .extend(adjustmentsSchema.shape)
  .extend(declarationSchema.shape)
  .extend(experienceSchema.shape)
  .extend(educationSchema.shape)
  .extend(referencesSchema.shape);

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
