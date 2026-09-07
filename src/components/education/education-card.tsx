import { GraduationCap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Education } from "@/types";

export function EducationCard({
  index,
  value,
  onRemove,
  canRemove,
}: {
  index: number;
  value: Partial<Education>;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <GraduationCap className="size-4 text-success" />
          Education {index + 1}
        </CardTitle>
        {canRemove && (
          <Button onClick={onRemove} size="sm" type="button" variant="ghost">
            <Trash2 />
            Remove
          </Button>
        )}
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`education-${index}-institution`}>Institution</Label>
          <Input defaultValue={value.institution} id={`education-${index}-institution`} placeholder="Enter institution" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`education-${index}-qualification`}>Qualification</Label>
          <Input defaultValue={value.qualification} id={`education-${index}-qualification`} placeholder="Enter qualification" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`education-${index}-subject`}>Subject</Label>
          <Input defaultValue={value.subject} id={`education-${index}-subject`} placeholder="Enter subject" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`education-${index}-grade`}>Grade</Label>
          <Input defaultValue={value.grade} id={`education-${index}-grade`} placeholder="Enter grade" />
        </div>
      </CardContent>
    </Card>
  );
}
