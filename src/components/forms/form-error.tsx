import { AlertCircle } from "lucide-react";

export function FormError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1 text-xs font-medium text-destructive" id={id} role="alert">
      <AlertCircle className="size-3.5" />
      {message}
    </p>
  );
}
