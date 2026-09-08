import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReviewSection({
  label,
  summary = "Information saved",
  onEdit,
  disabled = false,
}: {
  label: string;
  summary?: string;
  onEdit: () => void;
  disabled?: boolean;
}) {
  return (
    <Card>
      <CardContent className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-5">
        <div className="min-w-0">
          <p className="font-medium">{label}</p>
          <p className="mt-1 break-words text-sm text-muted-foreground">{summary}</p>
        </div>
        <Button disabled={disabled} onClick={onEdit} variant="outline">
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}
