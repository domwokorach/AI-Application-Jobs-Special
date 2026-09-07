import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/forms/form-error";

export type AddressFieldErrors = {
  line1?: string;
  city?: string;
  postcode?: string;
};

export function AddressFields({
  defaultValue,
  errors,
  registerField,
}: {
  defaultValue?: { line1?: string; line2?: string; city?: string; postcode?: string };
  errors?: AddressFieldErrors;
  registerField: (field: "line1" | "line2" | "city" | "postcode") => Record<string, unknown>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="address-line1">Address line 1</Label>
        <Input defaultValue={defaultValue?.line1} id="address-line1" {...registerField("line1")} />
        <FormError message={errors?.line1} />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="address-line2">Address line 2 (optional)</Label>
        <Input defaultValue={defaultValue?.line2} id="address-line2" {...registerField("line2")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address-city">City</Label>
        <Input defaultValue={defaultValue?.city} id="address-city" {...registerField("city")} />
        <FormError message={errors?.city} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address-postcode">Postcode</Label>
        <Input defaultValue={defaultValue?.postcode} id="address-postcode" {...registerField("postcode")} />
        <FormError message={errors?.postcode} />
      </div>
    </div>
  );
}
