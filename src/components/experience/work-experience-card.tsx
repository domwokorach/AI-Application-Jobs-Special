import { BriefcaseBusiness, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WorkExperience } from "@/types";

export function WorkExperienceCard({
  index,
  value,
  onRemove,
  canRemove,
}: {
  index: number;
  value: Partial<WorkExperience>;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <BriefcaseBusiness className="size-4 text-success" />
          Work experience {index + 1}
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
          <Label htmlFor={`work-${index}-title`}>Job title</Label>
          <Input defaultValue={value.title} id={`work-${index}-title`} placeholder="Enter job title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`work-${index}-employer`}>Employer</Label>
          <Input defaultValue={value.employer} id={`work-${index}-employer`} placeholder="Enter employer" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`work-${index}-start`}>Start date</Label>
          <Input defaultValue={value.startDate} id={`work-${index}-start`} type="month" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`work-${index}-end`}>End date</Label>
          <Input defaultValue={value.endDate} id={`work-${index}-end`} type="month" />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`work-${index}-responsibilities`}>Key responsibilities</Label>
          <Textarea defaultValue={value.responsibilities} id={`work-${index}-responsibilities`} rows={4} />
        </div>
      </CardContent>
    </Card>
  );
}
