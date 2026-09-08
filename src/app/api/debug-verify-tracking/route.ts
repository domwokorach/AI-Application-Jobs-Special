import { NextResponse } from "next/server";
import { getCandidateSessionId, requireCandidateSessionId } from "@/lib/candidate-session";
import { getSubmission, submitApplication } from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import { buildApplicationTimelineSteps, getNextStepMessage } from "@/features/applications/utils/application-timeline.utils";
import type { ApplicationFormValues } from "@/features/applications/schemas/application.schema";

export async function GET() {
  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission("demo-application");
  const tracking = await getApplicationTracking("demo-application");
  return NextResponse.json({ candidateId, submission, tracking });
}

export async function POST() {
  const ownerId = await requireCandidateSessionId();
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

  const submission = await submitApplication("demo-application", fakeData, ownerId);
  const tracking = await getApplicationTracking("demo-application");
  const steps = tracking ? buildApplicationTimelineSteps(tracking) : null;
  const nextStepMessage = tracking ? getNextStepMessage(tracking.currentStage) : null;

  return NextResponse.json({ submission, tracking, steps, nextStepMessage });
}
