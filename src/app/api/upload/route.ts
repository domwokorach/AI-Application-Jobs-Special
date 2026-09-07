import { NextResponse } from "next/server";

const acceptedTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);
const maxFileSize = 10_000_000;

export async function POST(request: Request) {
  const data = await request.formData();
  const file = data.get("file");
  if (!(file instanceof File) || !acceptedTypes.has(file.type) || file.size > maxFileSize) {
    return NextResponse.json({ message: "Upload a PDF, DOC or DOCX file up to 10MB." }, { status: 400 });
  }
  return NextResponse.json({ message: "Document storage has not been configured." }, { status: 501 });
}
