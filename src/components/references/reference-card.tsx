import { CircleUserRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Reference } from "@/types";

export function ReferenceCard({
  index,
  value,
  onRemove,
  canRemove,
}: {
  index: number;
  value: Partial<Reference>;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <CircleUserRound className="size-4 text-success" />
          Reference {index + 1}
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
          <Label htmlFor={`reference-${index}-name`}>Reference name</Label>
          <Input defaultValue={value.name} id={`reference-${index}-name`} placeholder="Enter full name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`reference-${index}-organisation`}>Organisation</Label>
          <Input defaultValue={value.organisation} id={`reference-${index}-organisation`} placeholder="Enter organisation" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`reference-${index}-email`}>Email address</Label>
          <Input defaultValue={value.email} id={`reference-${index}-email`} placeholder="name@example.com" type="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`reference-${index}-telephone`}>Telephone</Label>
          <Input defaultValue={value.telephone} id={`reference-${index}-telephone`} placeholder="Enter telephone number" type="tel" />
        </div>
      </CardContent>
    </Card>
  );
}
