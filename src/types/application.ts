export type ApplicationStatus =
  | "draft"
  | "ready-to-submit"
  | "submitting"
  | "submitted"
  | "under-review"
  | "interview"
  | "offer"
  | "unsuccessful"
  | "withdrawn";

export type ApplicationStepId =
  | "account" | "personal-details" | "job-preferences" | "about-you" | "cv"
  | "experience" | "skills" | "education" | "right-to-work" | "adjustments"
  | "equality-diversity" | "references" | "review";

export type ApplicationStep = {
  id: ApplicationStepId;
  label: string;
  optional?: boolean;
};

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
};

export type WorkExperience = {
  id: string;
  title: string;
  employer: string;
  startDate?: string;
  endDate?: string;
  responsibilities?: string;
};

export type Education = {
  id: string;
  institution: string;
  qualification: string;
  subject?: string;
  grade?: string;
};

export type Skill = { id: string; name: string; level?: string };
export type ReasonableAdjustment = { option: string; details?: string };
export type EqualityMonitoring = { ageGroup?: string; ethnicity?: string; disability?: string; gender?: string };
export type Reference = { id: string; name: string; organisation?: string; email: string; telephone?: string };
export type UploadedDocument = { id: string; fileName: string; contentType: string; size: number; url: string };

export type Application = {
  id: string;
  candidateId: string;
  jobId: string;
  status: ApplicationStatus;
  currentStep: ApplicationStepId;
  updatedAt: string;
  submittedAt?: string;
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  adjustments?: ReasonableAdjustment[];
  equalityMonitoring?: EqualityMonitoring;
  references: Reference[];
};
