"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PasswordInput } from "@/components/forms/password-input";
import { FormError } from "@/components/forms/form-error";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas/register.schema";
import { authApi, ApiError } from "@/lib/api/auth-client";
import { passwordRequirements } from "@/features/auth/schemas/password-policy";
import { countryOptions } from "@/constants/countries";
import { toast } from "sonner";

const titleOptions = ["Mr", "Mrs", "Miss", "Ms", "Mx", "Dr", "Prof"];

function Field({
  children,
  error,
  hint,
  htmlFor,
  label,
  required,
}: {
  children: React.ReactNode;
  error?: string;
  hint?: string;
  htmlFor: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      <FormError message={error} />
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { country: "United Kingdom", agreeToTerms: false },
  });

  function onSubmit(values: RegisterValues) {
    setFormError(undefined);
    startTransition(async () => {
      let result: { emailVerificationRequired: boolean };
      try {
        result = await authApi.register(values);
      } catch (error) {
        setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
        return;
      }
      toast.success(result.emailVerificationRequired ? "Account created — check your email to verify it" : "Account created");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit(onSubmit)} noValidate>
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Account details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.email?.message} htmlFor="email" label="Email address" required>
            <Input autoComplete="email" id="email" placeholder="name@example.com" type="email" {...register("email")} />
          </Field>
          <Field error={errors.confirmEmail?.message} htmlFor="confirmEmail" label="Confirm email address" required>
            <Input autoComplete="email" id="confirmEmail" type="email" {...register("confirmEmail")} />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Personal details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.title?.message} htmlFor="title" label="Title">
            <Controller
              control={control}
              name="title"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <SelectTrigger id="title">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {titleOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <div />
          <Field error={errors.firstName?.message} htmlFor="firstName" label="First name" required>
            <Input autoComplete="given-name" id="firstName" {...register("firstName")} />
          </Field>
          <Field error={errors.lastName?.message} htmlFor="lastName" label="Last name" required>
            <Input autoComplete="family-name" id="lastName" {...register("lastName")} />
          </Field>
          <Field error={errors.middleNames?.message} htmlFor="middleNames" label="Middle name(s)">
            <Input autoComplete="additional-name" id="middleNames" {...register("middleNames")} />
          </Field>
          <Field error={errors.preferredName?.message} htmlFor="preferredName" label="Preferred name" hint="If different from your first name.">
            <Input id="preferredName" {...register("preferredName")} />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Contact details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.mobile?.message} htmlFor="mobile" label="Mobile number" required>
            <Input autoComplete="tel" id="mobile" placeholder="+44 7123 456789" type="tel" {...register("mobile")} />
          </Field>
          <Field error={errors.alternativePhone?.message} htmlFor="alternativePhone" label="Alternative phone number">
            <Input autoComplete="tel" id="alternativePhone" type="tel" {...register("alternativePhone")} />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Address</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.addressLine1?.message} htmlFor="addressLine1" label="Address line 1" required>
            <Input autoComplete="address-line1" id="addressLine1" {...register("addressLine1")} />
          </Field>
          <Field error={errors.addressLine2?.message} htmlFor="addressLine2" label="Address line 2">
            <Input autoComplete="address-line2" id="addressLine2" {...register("addressLine2")} />
          </Field>
          <Field error={errors.city?.message} htmlFor="city" label="Town / City" required>
            <Input autoComplete="address-level2" id="city" {...register("city")} />
          </Field>
          <Field error={errors.county?.message} htmlFor="county" label="County / Region">
            <Input autoComplete="address-level1" id="county" {...register("county")} />
          </Field>
          <Field error={errors.postcode?.message} htmlFor="postcode" label="Postcode" required>
            <Input autoComplete="postal-code" id="postcode" {...register("postcode")} />
          </Field>
          <Field error={errors.country?.message} htmlFor="country" label="Country" required>
            <Controller
              control={control}
              name="country"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">
          Create a secure password. Your password must meet the portal&apos;s current security requirements.
        </p>
        <ul className="grid gap-1 text-xs text-muted-foreground">
          {passwordRequirements.map((requirement) => (
            <li className="flex items-center gap-1.5" key={requirement}>
              <span aria-hidden="true">✓</span>
              {requirement}
            </li>
          ))}
        </ul>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field error={errors.password?.message} htmlFor="password" label="Password" required>
            <PasswordInput autoComplete="new-password" id="password" {...register("password")} />
          </Field>
          <Field error={errors.confirmPassword?.message} htmlFor="confirmPassword" label="Confirm password" required>
            <PasswordInput autoComplete="new-password" id="confirmPassword" {...register("confirmPassword")} />
          </Field>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <div className="flex gap-3">
          <Controller
            control={control}
            name="agreeToTerms"
            render={({ field }) => (
              <Checkbox
                aria-describedby="agree-to-terms-error"
                checked={field.value}
                id="agreeToTerms"
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
          <Label className="font-normal leading-5" htmlFor="agreeToTerms">
            I agree to the{" "}
            <Link className="underline" href="/terms">
              Terms &amp; Conditions
            </Link>
            .
          </Label>
        </div>
        <FormError id="agree-to-terms-error" message={errors.agreeToTerms?.message} />
        <p className="text-xs text-muted-foreground">
          By creating an account, please review how we use personal information in our{" "}
          <Link className="underline" href="/privacy">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <FormError message={formError} />

      <Button className="w-full sm:w-auto" disabled={pending} type="submit">
        {pending ? "Creating account…" : "Create Account"}
      </Button>

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link className="font-medium text-foreground underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
