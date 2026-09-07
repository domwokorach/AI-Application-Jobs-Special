import { FileUpload } from "@/components/forms/file-upload";

export function CVUploader({ onUploaded }: { onUploaded?: (file: File) => void }) {
  return <FileUpload hint="PDF, DOC or DOCX · Maximum file size 10MB" onUploaded={onUploaded} title="Upload your CV" />;
}
