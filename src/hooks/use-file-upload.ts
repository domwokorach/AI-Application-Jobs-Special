"use client";

import { useCallback, useState } from "react";

export type FileUploadOptions = {
  acceptedTypes?: string[];
  maxSizeBytes?: number;
};

export const defaultAcceptedTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const defaultMaxSizeBytes = 10_000_000;

export function useFileUpload({ acceptedTypes = defaultAcceptedTypes, maxSizeBytes = defaultMaxSizeBytes }: FileUploadOptions = {}) {
  const [file, setFile] = useState<File>();
  const [error, setError] = useState<string>();

  const selectFile = useCallback(
    (next: File | undefined) => {
      if (!next) return;
      if (!acceptedTypes.includes(next.type)) {
        setError("This file type is not supported.");
        return;
      }
      if (next.size > maxSizeBytes) {
        setError(`Files must be smaller than ${Math.round(maxSizeBytes / 1_000_000)}MB.`);
        return;
      }
      setError(undefined);
      setFile(next);
    },
    [acceptedTypes, maxSizeBytes],
  );

  const clearFile = useCallback(() => {
    setFile(undefined);
    setError(undefined);
  }, []);

  return { file, error, selectFile, clearFile };
}
