import type { ApplicationStep } from "@/types";

export const applicationSteps: ApplicationStep[] = [
  { id: "account", label: "Account" },
  { id: "personal-details", label: "Personal details" },
  { id: "job-preferences", label: "Job preferences" },
  { id: "about-you", label: "About you" },
  { id: "cv", label: "CV" },
  { id: "experience", label: "Work experience" },
  { id: "skills", label: "Skills" },
  { id: "languages", label: "Languages", optional: true },
  { id: "education", label: "Education" },
  { id: "right-to-work", label: "Right to work" },
  { id: "adjustments", label: "Reasonable adjustments", optional: true },
  { id: "equality-diversity", label: "Equality & diversity", optional: true },
  { id: "references", label: "References" },
  { id: "review", label: "Review & submit" },
];
