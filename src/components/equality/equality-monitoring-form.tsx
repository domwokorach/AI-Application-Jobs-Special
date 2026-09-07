import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { preferNotToSay, equalityResponseOptions } from "@/constants/equality-options";

const questions = ["Age group", "Sex", "Gender identity", "Race or ethnic group", "Religion or belief", "Sexual orientation"];

export function EqualityMonitoringForm() {
  return (
    <div className="space-y-6">
      <Alert variant="info">
        <Info />
        <AlertTitle>Optional equality and diversity monitoring</AlertTitle>
        <AlertDescription>
          Providing this information is optional. It is used for equality and diversity monitoring and is not used to
          assess your application.
        </AlertDescription>
      </Alert>
      <div className="grid gap-5 sm:grid-cols-2">
        {questions.map((label) => {
          const id = label.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
          return (
            <div className="space-y-2" key={label}>
              <Label htmlFor={id}>{label}</Label>
              <Select>
                <SelectTrigger id={id}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {equalityResponseOptions.map((option) => (
                    <SelectItem key={option} value={option === "Prefer not to say" ? preferNotToSay : option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
