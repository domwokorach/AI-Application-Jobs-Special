import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ReviewSection({
  label,
  summary = "Information saved",
  onEdit,
}: {
  label: string;
  summary?: string;
  onEdit: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="font-medium">{label}</p>
          <p className="mt-1 text-sm text-muted-foreground">{summary}</p>
        </div>
        <Button onClick={onEdit} variant="outline">
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}
