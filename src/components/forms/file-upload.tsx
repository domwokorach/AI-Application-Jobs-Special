"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Paperclip, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useFileUpload } from "@/hooks/use-file-upload";

export function FileUpload({
  title = "Drag and drop your file here",
  hint = "PDF, DOC or DOCX · Maximum file size 10MB",
  onUploaded,
}: {
  title?: string;
  hint?: string;
  onUploaded?: (file: File) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { file, error, selectFile, clearFile } = useFileUpload();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  function handleSelect(next: File | undefined) {
    selectFile(next);
    if (next) {
      toast.success("File uploaded successfully");
      onUploaded?.(next);
    }
  }

  return (
    <Card className={`border-dashed transition-colors ${isDragging ? "border-primary bg-accent/40" : ""}`} aria-live="polite">
      <CardContent className="p-6">
        {file ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid size-11 place-items-center rounded-md bg-success/10 text-success">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{file.name}</p>
              <p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB · Upload complete</p>
              <Progress className="mt-2 h-1.5" value={100} />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => input.current?.click()} size="sm" variant="outline">
                Replace
              </Button>
              <Button aria-label="Remove uploaded file" onClick={clearFile} size="icon-sm" variant="ghost">
                <Trash2 />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="grid justify-items-center py-7 text-center"
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleSelect(event.dataTransfer.files[0]);
            }}
          >
            <span className="mb-3 grid size-11 place-items-center rounded-full bg-success/10 text-success">
              <UploadCloud className="size-5" />
            </span>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            <Button className="mt-4" onClick={() => input.current?.click()} type="button" variant="outline">
              <Paperclip />
              Browse files
            </Button>
          </div>
        )}
        <input
          accept=".pdf,.doc,.docx"
          className="sr-only"
          onChange={(event) => handleSelect(event.target.files?.[0])}
          ref={input}
          type="file"
        />
        {error && <p className="mt-3 flex items-center gap-1 text-sm text-destructive" role="alert">Upload error: {error}</p>}
      </CardContent>
    </Card>
  );
}
