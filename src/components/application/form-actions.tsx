import { Button } from "@/components/ui/button";

export function FormActions({
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  isSubmitting = false,
}: {
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-3">
      {onCancel && (
        <Button onClick={onCancel} type="button" variant="ghost">
          {cancelLabel}
        </Button>
      )}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </div>
  );
}
