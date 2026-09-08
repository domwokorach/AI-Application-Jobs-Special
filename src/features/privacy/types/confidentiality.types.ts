/** What kind of sensitive material a confidentiality warning or protection wrapper is guarding. */
export type ConfidentialResourceType =
  | "CV"
  | "COVER_LETTER"
  | "APPLICATION"
  | "RECRUITMENT_REVIEW"
  | "HIRING_MANAGER_REVIEW"
  | "HR_REVIEW"
  | "DOCUMENT";

export type ConfidentialitySensitivity = "CONFIDENTIAL" | "HIGHLY_CONFIDENTIAL";
