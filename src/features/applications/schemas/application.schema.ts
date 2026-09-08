import { z } from "zod";
import { personalDetailsSchema } from "./personal-details.schema";
import { adjustmentsSchema } from "./adjustments.schema";
import { declarationSchema } from "./declaration.schema";
import { experienceSchema } from "./experience.schema";
import { educationSchema } from "./education.schema";
import { equalitySchema } from "./equality.schema";
import { jobPreferencesSchema } from "./job-preferences.schema";
import { referencesSchema } from "./references.schema";
import { aboutYouSchema } from "./about-you.schema";
import { languagesSchema } from "./languages.schema";

export { personalDetailsSchema };
export * from "./job-preferences.schema";
export * from "./right-to-work.schema";
export * from "./equality.schema";
export * from "./about-you.schema";
export * from "./languages.schema";

export const applicationSchema = personalDetailsSchema
  .extend(jobPreferencesSchema.shape)
  .extend(adjustmentsSchema.shape)
  .extend(declarationSchema.shape)
  .extend(experienceSchema.shape)
  .extend(educationSchema.shape)
  .extend(equalitySchema.shape)
  .extend(referencesSchema.shape)
  .extend(aboutYouSchema.shape)
  .extend({ languages: languagesSchema });

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
