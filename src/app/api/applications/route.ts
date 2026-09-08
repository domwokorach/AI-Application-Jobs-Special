import { NextResponse } from "next/server";
import { applicationSchema } from "@/features/applications/schemas/application.schema";
import { aboutYouAutosaveSchema } from "@/features/applications/schemas/about-you.schema";
import { languagesAutosaveDataSchema } from "@/features/applications/schemas/languages.schema";

function isAboutYouRequest(payload: unknown): payload is { section: "about-you"; data: unknown } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "section" in payload &&
    "data" in payload &&
    payload.section === "about-you"
  );
}

function isLanguagesRequest(payload: unknown): payload is { section: "languages"; data: unknown } {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "section" in payload &&
    "data" in payload &&
    payload.section === "languages"
  );
}

async function saveApplication(request: Request) {
  const payload: unknown = await request.json();
  if (isAboutYouRequest(payload)) {
    const parsedAboutYou = aboutYouAutosaveSchema.safeParse(payload.data);
    if (!parsedAboutYou.success) {
      return NextResponse.json({ errors: parsedAboutYou.error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ section: "about-you", data: parsedAboutYou.data });
  }
  if (isLanguagesRequest(payload)) {
    const parsedLanguages = languagesAutosaveDataSchema.safeParse(payload.data);
    if (!parsedLanguages.success) {
      return NextResponse.json({ errors: parsedLanguages.error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ section: "languages", data: parsedLanguages.data });
  }

  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json({ message: "Application persistence has not been configured." }, { status: 501 });
}

export async function POST(request: Request) {
  return saveApplication(request);
}

export async function PATCH(request: Request) {
  return saveApplication(request);
}
