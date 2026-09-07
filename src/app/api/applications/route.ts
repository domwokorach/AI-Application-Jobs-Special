import { NextResponse } from "next/server";
import { applicationSchema } from "@/features/applications/schemas/application.schema";

export async function POST(request: Request) {
  const payload: unknown = await request.json();
  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  return NextResponse.json({ message: "Application persistence has not been configured." }, { status: 501 });
}
