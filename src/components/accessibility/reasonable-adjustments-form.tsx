"use client";

import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { adjustmentOptions } from "@/constants/adjustment-options";

export function ReasonableAdjustmentsForm({
  choice,
  details,
  onChoiceChange,
  onDetailsChange,
}: {
  choice?: "yes" | "no" | "discuss";
  details?: string;
  onChoiceChange: (value: "yes" | "no" | "discuss") => void;
  onDetailsChange: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <Alert variant="info">
        <Info />
        <AlertTitle>Confidential information</AlertTitle>
        <AlertDescription>
          Tell us about any adjustments or support you need during the recruitment process. This information will be handled confidentially.
        </AlertDescription>
      </Alert>
      <div className="space-y-2">
        <Label>Do you require any reasonable adjustments or additional support during the recruitment process?</Label>
        <RadioGroup onValueChange={(value) => onChoiceChange(value as "yes" | "no" | "discuss")} value={choice}>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="adjustments-yes" value="yes" />
            <Label htmlFor="adjustments-yes">Yes</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="adjustments-no" value="no" />
            <Label htmlFor="adjustments-no">No</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem id="adjustments-discuss" value="discuss" />
            <Label htmlFor="adjustments-discuss">Prefer to discuss</Label>
          </div>
        </RadioGroup>
      </div>
      {choice === "yes" && (
        <div className="space-y-5 rounded-lg border bg-card p-5">
          <p className="text-sm font-medium">Select any support that would be helpful.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {adjustmentOptions.map((option) => (
              <label className="flex min-h-7 items-center gap-2 text-sm" key={option}>
                <Checkbox />
                {option}
              </label>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjustment-details">Please tell us what adjustment or support would help you</Label>
            <Textarea
              id="adjustment-details"
              onChange={(event) => onDetailsChange(event.target.value)}
              placeholder="For example, extra time for an assessment or an accessible interview location."
              rows={5}
              value={details}
            />
          </div>
        </div>
      )}
    </div>
  );
}
