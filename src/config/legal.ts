import { siteConfig } from "@/config/site";

export interface LegalConfig {
  organisationName: string;
  termsLastUpdated?: string;
  privacyLastUpdated?: string;
  accessibilityLastReviewed?: string;
  privacyContact?: string;
  accessibilityContact?: string;
  recruitmentContact?: string;
}

// Public legal content must be approved and kept current by the organisation before production use.
export const legalConfig: LegalConfig = {
  organisationName: siteConfig.name,
};
