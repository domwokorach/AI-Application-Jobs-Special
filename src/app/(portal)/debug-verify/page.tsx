import { connection } from "next/server";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { submitApplication, getSubmission } from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import { buildApplicationTimelineSteps, getNextStepMessage } from "@/features/applications/utils/application-timeline.utils";
import type { ApplicationFormValues } from "@/features/applications/schemas/application.schema";

export default async function DebugVerifyPage() {
  await connection();
  const ownerId = (await getCandidateSessionId()) ?? "debug-owner";

  const existing = await getSubmission("demo-application");
  if (!existing) {
    const fakeData = {
      fullName: "Alex Morgan",
      email: "alex.morgan@example.com",
      mobile: "07123456789",
      dateOfBirth: "01/01/90",
      address: "1 Test Street",
      postcode: "SW1A 1AA",
      role: "Software Engineer",
      location: "London",
      preferredEmployer: "",
      employmentType: "Permanent",
      availableFrom: "",
      personalProfile: "Experienced professional.",
      roleInterest: "Excited about this role.",
      languages: [],
      adjustments: undefined,
      adjustmentDetails: "",
      ageGroup: "",
      sex: "",
      genderIdentity: "",
      ethnicity: "",
      religion: "",
      sexualOrientation: "",
      declarationAccurate: true,
      declarationEditRestriction: true,
      work: [{ title: "Engineer", employer: "Acme" }],
      education: [{ institution: "Test University", qualification: "BSc" }],
      references: [{ name: "Jamie Ref", email: "jamie@example.com" }],
    } as unknown as ApplicationFormValues;
    await submitApplication("demo-application", fakeData, ownerId);
  }

  const tracking = await getApplicationTracking("demo-application");
  const steps = tracking ? buildApplicationTimelineSteps(tracking) : null;
  const nextStepMessage = tracking ? getNextStepMessage(tracking.currentStage) : null;

  return <pre>{JSON.stringify({ ownerId, tracking, steps, nextStepMessage }, null, 2)}</pre>;
}
