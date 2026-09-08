import { z } from "zod";

export const PERSONAL_PROFILE_MAX_LENGTH = 500;
export const ROLE_INTEREST_MAX_LENGTH = 2000;

export type AboutYouFieldConfiguration = {
  personalProfile: { required: boolean };
  roleInterest: { required: boolean };
};

// Vacancy configuration can override these flags when its question settings are available.
export const defaultAboutYouFieldConfiguration: AboutYouFieldConfiguration = {
  personalProfile: { required: true },
  roleInterest: { required: true },
};

const personalProfileLimitSchema = z
  .string()
  .max(PERSONAL_PROFILE_MAX_LENGTH, "Your personal profile must be 500 characters or fewer.");

const roleInterestLimitSchema = z
  .string()
  .max(ROLE_INTEREST_MAX_LENGTH, "Your answer must be 2,000 characters or fewer.");

export function createAboutYouSchema(
  configuration: AboutYouFieldConfiguration = defaultAboutYouFieldConfiguration,
) {
  return z.object({
    personalProfile: configuration.personalProfile.required
      ? personalProfileLimitSchema.trim().min(1, "Enter your personal profile.")
      : personalProfileLimitSchema.optional(),
    roleInterest: configuration.roleInterest.required
      ? roleInterestLimitSchema.trim().min(1, "Tell us why you're interested in this role.")
      : roleInterestLimitSchema.optional(),
  });
}

export const aboutYouSchema = createAboutYouSchema();

// Drafts intentionally allow blank required answers while a candidate is still completing the section.
export const aboutYouAutosaveSchema = z.object({
  personalProfile: personalProfileLimitSchema,
  roleInterest: roleInterestLimitSchema,
});
