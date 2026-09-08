"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormError } from "@/components/forms/form-error";
import {
  personalDetailsSchema,
  contactDetailsSchema,
  addressDetailsSchema,
  type PersonalDetailsValues,
  type ContactDetailsValues,
  type AddressDetailsValues,
} from "@/features/profile/schemas/profile.schema";
import {
  updatePersonalDetailsAction,
  updateContactDetailsAction,
  updateAddressAction,
} from "@/features/profile/actions/update-profile.actions";
import { countryOptions } from "@/constants/countries";
import { accountFullName } from "@/types/account";
import type { PublicAccount } from "@/types";
import { toast } from "sonner";

function maskPhone(value: string): string {
  return value.length <= 4 ? value : `${value.slice(0, 3)}${"•".repeat(Math.max(value.length - 6, 4))}${value.slice(-3)}`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 4))}@${domain}`;
}

export function ProfileSections({ account }: { account: PublicAccount }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <PersonalDetailsSection account={account} onSaved={() => router.refresh()} />
      <ContactDetailsSection account={account} onSaved={() => router.refresh()} />
      <AddressSection account={account} onSaved={() => router.refresh()} />
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium">Account security</p>
            <p className="mt-1 text-sm text-muted-foreground">{maskEmail(account.email)}</p>
            <p className="text-sm text-muted-foreground">Password •••••••••••••</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/account/security">Change Password</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SectionCard({
  title,
  summary,
  editLabel,
  dialogTitle,
  children,
}: {
  title: string;
  summary: React.ReactNode;
  editLabel: string;
  dialogTitle: string;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="font-medium">{title}</p>
          <div className="mt-1 space-y-0.5 text-sm text-muted-foreground">{summary}</div>
        </div>
        <Dialog onOpenChange={setOpen} open={open}>
          <DialogTrigger asChild>
            <Button variant="outline">{editLabel}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>Changes are saved to your account only — they don&apos;t rewrite any application you&apos;ve already submitted.</DialogDescription>
            </DialogHeader>
            {children(() => setOpen(false))}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function PersonalDetailsSection({ account, onSaved }: { account: PublicAccount; onSaved: () => void }) {
  return (
    <SectionCard
      dialogTitle="Edit personal details"
      editLabel="Edit"
      summary={<p>{accountFullName(account)}{account.preferredName ? ` (${account.preferredName})` : ""}</p>}
      title="Personal details"
    >
      {(close) => <PersonalDetailsForm account={account} onCancel={close} onSaved={() => { onSaved(); close(); }} />}
    </SectionCard>
  );
}

function PersonalDetailsForm({ account, onCancel, onSaved }: { account: PublicAccount; onCancel: () => void; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      title: account.title ?? "",
      firstName: account.firstName,
      middleNames: account.middleNames ?? "",
      lastName: account.lastName,
      preferredName: account.preferredName ?? "",
    },
  });

  function onSubmit(values: PersonalDetailsValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await updatePersonalDetailsAction(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      toast.success("Personal details updated");
      onSaved();
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="pd-firstName">First name</Label>
          <Input id="pd-firstName" {...register("firstName")} />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pd-lastName">Last name</Label>
          <Input id="pd-lastName" {...register("lastName")} />
          <FormError message={errors.lastName?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pd-middleNames">Middle name(s)</Label>
          <Input id="pd-middleNames" {...register("middleNames")} />
          <FormError message={errors.middleNames?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pd-preferredName">Preferred name</Label>
          <Input id="pd-preferredName" {...register("preferredName")} />
          <FormError message={errors.preferredName?.message} />
        </div>
      </div>
      <FormError message={formError} />
      <DialogFooter>
        <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
        <Button disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</Button>
      </DialogFooter>
    </form>
  );
}

function ContactDetailsSection({ account, onSaved }: { account: PublicAccount; onSaved: () => void }) {
  return (
    <SectionCard
      dialogTitle="Edit contact details"
      editLabel="Edit"
      summary={
        <>
          <p>{maskPhone(account.mobile)}</p>
          {account.alternativePhone && <p>{maskPhone(account.alternativePhone)}</p>}
        </>
      }
      title="Contact details"
    >
      {(close) => <ContactDetailsForm account={account} onCancel={close} onSaved={() => { onSaved(); close(); }} />}
    </SectionCard>
  );
}

function ContactDetailsForm({ account, onCancel, onSaved }: { account: PublicAccount; onCancel: () => void; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactDetailsValues>({
    resolver: zodResolver(contactDetailsSchema),
    defaultValues: { mobile: account.mobile, alternativePhone: account.alternativePhone ?? "" },
  });

  function onSubmit(values: ContactDetailsValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await updateContactDetailsAction(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      toast.success("Contact details updated");
      onSaved();
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="cd-mobile">Mobile number</Label>
        <Input id="cd-mobile" type="tel" {...register("mobile")} />
        <FormError message={errors.mobile?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cd-alt">Alternative phone number</Label>
        <Input id="cd-alt" type="tel" {...register("alternativePhone")} />
        <FormError message={errors.alternativePhone?.message} />
      </div>
      <FormError message={formError} />
      <DialogFooter>
        <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
        <Button disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</Button>
      </DialogFooter>
    </form>
  );
}

function AddressSection({ account, onSaved }: { account: PublicAccount; onSaved: () => void }) {
  return (
    <SectionCard
      dialogTitle="Edit address"
      editLabel="Edit"
      summary={
        account.address ? (
          <>
            <p>{account.address.city}</p>
            <p>{account.address.country}</p>
          </>
        ) : (
          <p>Not provided</p>
        )
      }
      title="Address"
    >
      {(close) => <AddressForm account={account} onCancel={close} onSaved={() => { onSaved(); close(); }} />}
    </SectionCard>
  );
}

function AddressForm({ account, onCancel, onSaved }: { account: PublicAccount; onCancel: () => void; onSaved: () => void }) {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string>();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressDetailsValues>({
    resolver: zodResolver(addressDetailsSchema),
    defaultValues: {
      addressLine1: account.address?.line1 ?? "",
      addressLine2: account.address?.line2 ?? "",
      city: account.address?.city ?? "",
      county: account.address?.county ?? "",
      postcode: account.address?.postcode ?? "",
      country: account.address?.country ?? "United Kingdom",
    },
  });

  function onSubmit(values: AddressDetailsValues) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await updateAddressAction(values);
      if (!result.success) {
        setFormError(result.message);
        return;
      }
      toast.success("Address updated");
      onSaved();
    });
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-2">
        <Label htmlFor="addr-line1">Address line 1</Label>
        <Input id="addr-line1" {...register("addressLine1")} />
        <FormError message={errors.addressLine1?.message} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="addr-line2">Address line 2</Label>
        <Input id="addr-line2" {...register("addressLine2")} />
        <FormError message={errors.addressLine2?.message} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="addr-city">Town / City</Label>
          <Input id="addr-city" {...register("city")} />
          <FormError message={errors.city?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-county">County / Region</Label>
          <Input id="addr-county" {...register("county")} />
          <FormError message={errors.county?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-postcode">Postcode</Label>
          <Input id="addr-postcode" {...register("postcode")} />
          <FormError message={errors.postcode?.message} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-country">Country</Label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger id="addr-country">
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
          <FormError message={errors.country?.message} />
        </div>
      </div>
      <FormError message={formError} />
      <DialogFooter>
        <Button onClick={onCancel} type="button" variant="outline">Cancel</Button>
        <Button disabled={pending} type="submit">{pending ? "Saving…" : "Save changes"}</Button>
      </DialogFooter>
    </form>
  );
}
