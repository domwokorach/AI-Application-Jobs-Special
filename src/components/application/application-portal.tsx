"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarIcon, CheckCircle2, ChevronDown, CircleUserRound, FileText, GraduationCap, Info, Mail, MapPin, Paperclip, Plus, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Path } from "react-hook-form";
import { ApplicationShell } from "./application-shell";
import { applicationSteps } from "@/constants/application-steps";
import { applicationSchema, type ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import { resendConfirmationEmailAction, submitApplicationAction } from "@/features/applications/actions/submit-application.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FormSection } from "@/components/forms/form-section";
import { FormError } from "@/components/forms/form-error";
import { StatusBadge } from "@/components/application/status-badge";
import type { ApplicationStatus } from "@/types";

type Values = ApplicationFormValues;

const APPLICATION_ID = "demo-application";
type SubmissionResult = {
  reference: string;
  submittedAt: string;
  email: string;
  jobTitle: string;
  location?: string;
  emailDelivered: boolean;
};

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 4))}@${domain}`;
}

function Field({ children, label, hint, error, required = false }: { children: React.ReactNode; label: string; hint?: string; error?: string; required?: boolean }) {
  const id = label.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
  return <div className="space-y-2"><Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>{children}{hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}{error && <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-destructive" role="alert"><AlertCircle className="size-3.5" />{error}</p>}</div>;
}

function DatePickerField({ label }: { label: string }) {
  const [date, setDate] = useState<Date>();
  return <Field label={label}><Popover><PopoverTrigger asChild><Button className="w-full justify-start font-normal" variant="outline"><CalendarIcon className="mr-2 size-4" />{date ? format(date, "PPP") : "Choose a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" onSelect={setDate} selected={date} /></PopoverContent></Popover></Field>;
}

function FileUpload() {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  function chooseFile(next?: File) {
    if (!next) return;
    if (!["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(next.type) || next.size > 10_000_000) { toast.error("Choose a PDF, DOC or DOCX file up to 10MB."); return; }
    setFile(next); setProgress(100); toast.success("CV uploaded successfully");
  }
  return <Card className="border-dashed"><CardContent className="p-6">
    {file ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-md bg-emerald-100 text-emerald-800"><FileText className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB · Upload complete</p><Progress className="mt-2 h-1.5" value={progress} /></div><div className="flex gap-2"><Button onClick={() => input.current?.click()} size="sm" variant="outline">Replace</Button><Button onClick={() => { setFile(undefined); setProgress(0); }} size="icon-sm" variant="ghost" aria-label="Remove uploaded CV"><Trash2 /></Button></div></div> : <div className="grid justify-items-center py-7 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}><span className="mb-3 grid size-11 place-items-center rounded-full bg-emerald-100 text-emerald-800"><UploadCloud className="size-5" /></span><h2 className="text-sm font-semibold">Drag and drop your CV here</h2><p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX · Maximum file size 10MB</p><Button className="mt-4" onClick={() => input.current?.click()} type="button" variant="outline"><Paperclip />Browse files</Button></div>}
    <input className="sr-only" accept=".pdf,.doc,.docx" onChange={(event) => chooseFile(event.target.files?.[0])} ref={input} type="file" />
  </CardContent></Card>;
}

function RepeatableCards({ control, register, kind }: { control: ReturnType<typeof useForm<Values>>["control"]; register: ReturnType<typeof useForm<Values>>["register"]; kind: "work" | "education" | "references" }) {
  const { fields, append, remove } = useFieldArray({ control, name: kind });
  const config = kind === "work"
    ? { title: "Work experience", icon: BriefcaseBusiness, empty: { title: "", employer: "" }, inputs: [{ label: "Job title", name: "title" }, { label: "Employer", name: "employer" }] }
    : kind === "education"
    ? { title: "Education and qualifications", icon: GraduationCap, empty: { institution: "", qualification: "" }, inputs: [{ label: "Institution", name: "institution" }, { label: "Qualification", name: "qualification" }] }
    : { title: "References", icon: CircleUserRound, empty: { name: "", email: "" }, inputs: [{ label: "Reference name", name: "name" }, { label: "Email address", name: "email" }] };
  const Icon = config.icon;
  return <div className="space-y-4">{fields.map((item, index) => <Card key={item.id}><CardHeader className="flex-row items-center justify-between space-y-0 pb-4"><CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4 text-emerald-700" />{config.title} {index + 1}</CardTitle>{fields.length > 1 && <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost"><Trash2 />Remove</Button>}</CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{config.inputs.map((field) => <Field key={field.name} label={field.label}><Input placeholder={`Enter ${field.label.toLowerCase()}`} {...register(`${kind}.${index}.${field.name}` as Path<Values>)} /></Field>)}</CardContent></Card>)}<Button onClick={() => append(config.empty as never)} type="button" variant="outline"><Plus />Add another</Button></div>;
}

function Dashboard({ onContinue, status, submission }: { onContinue: () => void; status: ApplicationStatus; submission?: SubmissionResult }) {
  const submitted = status === "submitted";
  return <div className="min-h-screen bg-stone-50"><header className="border-b bg-white"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5"><div className="flex items-center gap-2 font-serif text-2xl font-semibold"><span className="grid size-8 place-items-center rounded-full bg-emerald-950 font-sans text-sm text-lime-200">N</span>northstar</div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost"><CircleUserRound />Alex Morgan<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>Profile settings</DropdownMenuItem><DropdownMenuItem>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14"><p className="text-sm font-medium text-emerald-700">Good afternoon, Alex</p><h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Your applications</h1><div className="mt-9 grid gap-6 lg:grid-cols-[1.6fr_1fr]"><Card><CardHeader><div className="flex items-start justify-between gap-3"><div><StatusBadge status={status} /><CardTitle className="mt-3 font-serif text-2xl">{submission?.jobTitle || "Application"}</CardTitle><CardDescription className="mt-2 flex items-center gap-1"><MapPin className="size-3.5" />{submission?.location || "Location not specified"}</CardDescription></div><BriefcaseBusiness className="size-6 text-emerald-700" /></div></CardHeader><CardContent><Separator />
      {submitted && submission ? (
        <div className="mt-5 space-y-1 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-emerald-700"><CheckCircle2 className="size-4" />Application submitted</p>
          <p className="text-muted-foreground">Reference: <span className="font-mono font-medium text-foreground">{submission.reference}</span></p>
          <p className="text-muted-foreground">Submitted: {format(new Date(submission.submittedAt), "d MMMM yyyy")}</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">Application progress</p><div className="mt-2 flex items-center gap-3"><Progress className="w-48" value={36} /><span className="text-sm font-semibold">5 of {applicationSteps.length} sections</span></div></div><p className="text-xs text-muted-foreground">Last saved today, 14:32</p></div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">{submitted ? <Button onClick={onContinue} variant="outline">View Application</Button> : <><Button onClick={onContinue}>Continue application <ArrowRight /></Button><Button onClick={onContinue} variant="outline">View application</Button></>}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Profile summary</CardTitle><CardDescription>Keep your details up to date to make applying faster.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-800">AM</span><div><p className="text-sm font-semibold">Alex Morgan</p><p className="text-xs text-muted-foreground">alex.morgan@example.com</p></div></div><Separator /><p className="text-sm text-muted-foreground">Your profile is 80% complete.</p><Button className="w-full" variant="outline">Manage profile</Button></CardContent></Card></div>
      <section className="mt-10"><h2 className="font-serif text-2xl">Recent activity</h2><Card className="mt-4"><CardContent className="flex items-center gap-3 p-5"><CheckCircle2 className="size-5 text-emerald-700" /><div><p className="text-sm font-medium">{submitted ? "Application submitted" : "Personal details saved"}</p><p className="text-xs text-muted-foreground">Today at 14:32</p></div></CardContent></Card></section></main></div>;
}

export function ApplicationPortal({
  initialScreen = "dashboard",
  initialStep = 1,
  initialSubmission,
}: {
  initialScreen?: "dashboard" | "form";
  initialStep?: number;
  initialSubmission?: SubmissionResult;
}) {
  const [screen, setScreen] = useState<"dashboard" | "form">(initialScreen);
  const [current, setCurrent] = useState(initialStep);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>(initialSubmission ? "submitted" : "draft");
  const [submission, setSubmission] = useState<SubmissionResult | undefined>(initialSubmission);
  const form = useForm<Values>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      address: "",
      postcode: "",
      role: "",
      location: "",
      employmentType: undefined,
      availableFrom: "",
      adjustments: undefined,
      adjustmentDetails: "",
      declarationAccurate: false,
      declarationEditRestriction: false,
      work: [{ title: "", employer: "" }],
      education: [{ institution: "", qualification: "" }],
      references: [{ name: "", email: "" }],
    },
  });
  const step = applicationSteps[current];
  const errors = form.formState.errors;
  const isLastStep = current === applicationSteps.length - 1;

  async function next() {
    if (current === 1) {
      const valid = await form.trigger(["fullName", "email", "mobile", "address", "postcode"]);
      if (!valid) {
        toast.error("Please correct the highlighted fields.");
        return;
      }
    }
    setCurrent((value) => value + 1);
    toast.success("Changes saved");
  }

  if (screen === "dashboard") {
    return <Dashboard onContinue={() => { setScreen("form"); setCurrent(applicationSteps.length - 1); }} status={applicationStatus} submission={submission} />;
  }
  if (applicationStatus === "submitted" && submission) {
    return (
      <Confirmation
        applicationId={APPLICATION_ID}
        onDashboard={() => setScreen("dashboard")}
        onSubmission={setSubmission}
        submission={submission}
      />
    );
  }
  return (
    <ApplicationShell current={current} onSelect={setCurrent} steps={applicationSteps}>
      <main className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8 sm:pt-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step {current + 1} of {applicationSteps.length}</p>
        <FormSection title={step.label} optional={step.optional} description={descriptionFor(step.id)}>
          <StepContents
            applicationId={APPLICATION_ID}
            applicationStatus={applicationStatus}
            control={form.control}
            current={current}
            errors={errors}
            form={form}
            onEdit={setCurrent}
            onStatusChange={setApplicationStatus}
            onSubmitted={setSubmission}
          />
          <nav className="fixed inset-x-0 bottom-0 z-10 flex min-h-18 items-center justify-between border-t bg-white/95 px-5 py-3 backdrop-blur md:static md:mt-10 md:border-b md:bg-transparent md:px-0">
            <Button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} variant="ghost"><ArrowLeft />Previous</Button>
            {!isLastStep && <Button onClick={next}>Save and continue<ArrowRight /></Button>}
          </nav>
        </FormSection>
      </main>
    </ApplicationShell>
  );
}

function descriptionFor(id: string) { return ({ account: "Create an account to securely save your application and return whenever you need.", "personal-details": "Please provide the details we need to contact you about your application.", "job-preferences": "Tell us which role and working arrangements are the best fit for you.", "about-you": "Share a short introduction and why this opportunity interests you.", cv: "Upload your CV in PDF, DOC or DOCX format. You can still complete this application without one.", experience: "Add your employment history. If you have no previous experience, leave this section blank.", skills: "Add skills, languages, licences and professional qualifications relevant to this role.", education: "Tell us about your education and qualifications.", "right-to-work": "We need to confirm your eligibility to work in the UK.", adjustments: "Tell us how we can make the recruitment process accessible and supportive for you.", "equality-diversity": "Help us understand whether our recruitment is fair and inclusive.", references: "Add people who can comment on your work or character.", review: "Review your application, then confirm the declaration to submit it." } as Record<string, string>)[id]; }

function StepContents({
  current,
  control,
  errors,
  form,
  onEdit,
  applicationId,
  applicationStatus,
  onStatusChange,
  onSubmitted,
}: {
  current: number;
  control: ReturnType<typeof useForm<Values>>["control"];
  errors: ReturnType<typeof useForm<Values>>["formState"]["errors"];
  form: ReturnType<typeof useForm<Values>>;
  onEdit: (index: number) => void;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  onSubmitted: (result: SubmissionResult) => void;
}) {
  if (current === 4) return <FileUpload />;
  if ([5, 7, 11].includes(current)) return <RepeatableCards control={control} kind={current === 5 ? "work" : current === 7 ? "education" : "references"} register={form.register} />;
  if (current === 9) return <Adjustments form={form} />;
  if (current === 10) return <Equality />;
  if (current === applicationSteps.length - 1) {
    return (
      <ReviewAndSubmit
        applicationId={applicationId}
        applicationStatus={applicationStatus}
        errors={errors}
        form={form}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        onSubmitted={onSubmitted}
      />
    );
  }
  if (current === 8) return <div className="grid gap-6"><Field label="Do you currently have the right to work in the UK?" required><RadioGroup defaultValue="yes"><div className="flex items-center gap-2"><RadioGroupItem id="right-yes" value="yes" /><Label htmlFor="right-yes">Yes, without restrictions</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-visa" value="visa" /><Label htmlFor="right-visa">Yes, with a current visa</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-no" value="no" /><Label htmlFor="right-no">No</Label></div></RadioGroup></Field><Field label="Will you require visa sponsorship?" required><Select><SelectTrigger><SelectValue placeholder="Choose an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></Field></div>;
  if (current === 1) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" error={errors.fullName?.message} required><Input aria-describedby={errors.fullName ? "full-name-error" : undefined} {...form.register("fullName")} placeholder="Enter your full name" /></Field><Field label="Email address" error={errors.email?.message} required><Input {...form.register("email")} placeholder="you@example.com" type="email" /></Field><Field label="Mobile number" error={errors.mobile?.message} required><Input {...form.register("mobile")} placeholder="07123 456789" type="tel" /></Field><DatePickerField label="Date of birth" /><Field label="Home address" error={errors.address?.message} required><Input {...form.register("address")} placeholder="Start typing your address" /></Field><Field label="Postcode" error={errors.postcode?.message} required><Input {...form.register("postcode")} placeholder="e.g. SW1A 1AA" /></Field></div>;
  if (current === 0) return <div className="grid gap-5"><Field label="Email address" required><Input placeholder="you@example.com" type="email" /></Field><Field label="Create password" hint="Use at least 12 characters." required><Input type="password" /></Field><Field label="Confirm password" required><Input type="password" /></Field></div>;
  if (current === 2) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Job or role you are applying for" required><Select onValueChange={(value) => form.setValue("role", value, { shouldValidate: true })} value={form.watch("role")}><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent><SelectItem value="Customer Experience Associate">Customer Experience Associate</SelectItem><SelectItem value="Customer Experience Team Lead">Customer Experience Team Lead</SelectItem></SelectContent></Select></Field><Field label="Preferred location"><Select onValueChange={(value) => form.setValue("location", value)} value={form.watch("location")}><SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger><SelectContent><SelectItem value="London">London</SelectItem><SelectItem value="Remote">Remote</SelectItem></SelectContent></Select></Field><Field label="Employment type"><Select onValueChange={(value) => form.setValue("employmentType", value as Values["employmentType"])} value={form.watch("employmentType")}><SelectTrigger><SelectValue placeholder="Select employment type" /></SelectTrigger><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="temporary">Temporary</SelectItem></SelectContent></Select></Field><DatePickerField label="Available start date" /></div>;
  if (current === 3) return <div className="space-y-5"><Field label="Personal profile" hint="Up to 500 words"><Textarea placeholder="Tell us a little about yourself and your experience." rows={6} /></Field><Field label="Why are you interested in this role?"><Textarea placeholder="Share why this opportunity appeals to you." rows={5} /></Field></div>;
  return <div className="grid gap-5 sm:grid-cols-2"><Field label="Key skills"><Input placeholder="e.g. Customer service, Excel, teamwork" /></Field><Field label="Languages"><Input placeholder="Include your level of fluency" /></Field><Field label="Driving licence"><Select><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="na">Not applicable</SelectItem></SelectContent></Select></Field><Field label="Professional qualifications"><Input placeholder="Add relevant certificates" /></Field></div>;
}

function Adjustments({ form }: { form: ReturnType<typeof useForm<Values>> }) {
  const choice = form.watch("adjustments");
  const options = ["Visual impairment support", "Deaf or hard-of-hearing support", "Mobility or physical accessibility", "Learning disability support", "Neurodivergence-related adjustment", "Communication support", "Accessible interview location", "Extra assessment time", "Other"];
  return <div className="space-y-6"><Alert className="border-emerald-200 bg-emerald-50"><Info /><AlertTitle>Confidential information</AlertTitle><AlertDescription>This information will be handled confidentially and, where practicable, separately from the information used to assess your application.</AlertDescription></Alert><Field label="Do you require any reasonable adjustments or additional support during the recruitment process?"><RadioGroup onValueChange={(value) => form.setValue("adjustments", value as Values["adjustments"])} value={choice}><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-yes" value="yes" /><Label htmlFor="adjustments-yes">Yes</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-no" value="no" /><Label htmlFor="adjustments-no">No</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-discuss" value="discuss" /><Label htmlFor="adjustments-discuss">Prefer to discuss</Label></div></RadioGroup></Field>{choice === "yes" && <div className="space-y-5 rounded-lg border bg-white p-5"><p className="text-sm font-medium">Select any support that would be helpful.</p><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <label className="flex min-h-7 items-center gap-2 text-sm" key={option}><Checkbox />{option}</label>)}</div><Field label="Please tell us what adjustment or support would help you"><Textarea {...form.register("adjustmentDetails")} placeholder="For example, extra time for an assessment or an accessible interview location." rows={5} /></Field></div>}</div>;
}

function Equality() { return <div className="space-y-6"><Alert className="border-indigo-200 bg-indigo-50"><Info /><AlertTitle>Optional equality and diversity monitoring</AlertTitle><AlertDescription>Providing this information is optional. It is used for equality and diversity monitoring and is not used to assess your application.</AlertDescription></Alert><div className="grid gap-5 sm:grid-cols-2">{["Age group", "Sex", "Gender identity", "Race or ethnic group", "Religion or belief", "Sexual orientation"].map((label) => <Field key={label} label={label}><Select><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="prefer-not">Prefer not to say</SelectItem><SelectItem value="option-1">Option 1</SelectItem><SelectItem value="option-2">Option 2</SelectItem></SelectContent></Select></Field>)}</div></div>; }

function ReviewAndSubmit({
  form,
  errors,
  onEdit,
  applicationId,
  applicationStatus,
  onStatusChange,
  onSubmitted,
}: {
  form: ReturnType<typeof useForm<Values>>;
  errors: ReturnType<typeof useForm<Values>>["formState"]["errors"];
  onEdit: (index: number) => void;
  applicationId: string;
  applicationStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  onSubmitted: (result: SubmissionResult) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const accurate = form.watch("declarationAccurate");
  const editRestriction = form.watch("declarationEditRestriction");
  const isSubmitted = applicationStatus === "submitted";

  const sections = [
    { label: "Personal details", step: 1 },
    { label: "Job preferences", step: 2 },
    { label: "Work experience", step: 5 },
    { label: "Skills", step: 6 },
    { label: "Education", step: 7 },
    { label: "Right to work", step: 8 },
    { label: "Reasonable adjustments", step: 9 },
    { label: "References", step: 11 },
  ];

  function handleSubmitClick() {
    form.handleSubmit(
      () => {
        onStatusChange("ready-to-submit");
        setConfirmOpen(true);
      },
      () => toast.error("Please complete all required sections before submitting."),
    )();
  }

  function handleConfirmSubmit() {
    if (isPending) return;
    setSubmitError(undefined);
    onStatusChange("submitting");
    startTransition(async () => {
      const result = await submitApplicationAction(applicationId, form.getValues());
      if (!result.success) {
        setSubmitError(result.message);
        onStatusChange("ready-to-submit");
        return;
      }
      onStatusChange("submitted");
      setConfirmOpen(false);
      onSubmitted({
        reference: result.reference,
        submittedAt: result.submittedAt,
        email: result.email,
        jobTitle: result.jobTitle,
        location: result.location,
        emailDelivered: result.emailDelivered,
      });
    });
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertTitle>Almost ready to submit</AlertTitle>
        <AlertDescription>Complete your declaration below before submitting. Optional equality monitoring is not included in this review.</AlertDescription>
      </Alert>
      {sections.map((section) => (
        <Card key={section.label}>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="font-medium">{section.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">Information saved</p>
            </div>
            <Button disabled={isSubmitted} onClick={() => onEdit(section.step)} variant="outline">
              Edit
            </Button>
          </CardContent>
        </Card>
      ))}

      {isSubmitted ? (
        <Alert className="border-success/40 bg-success/10">
          <CheckCircle2 />
          <AlertTitle>Application submitted</AlertTitle>
          <AlertDescription>This application has already been submitted and can no longer be edited.</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Declaration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Checkbox
                checked={accurate}
                id="declaration-accurate"
                onCheckedChange={(checked) => form.setValue("declarationAccurate", checked === true, { shouldValidate: true })}
              />
              <Label className="font-normal leading-5" htmlFor="declaration-accurate">
                I confirm that the information provided in this application is complete and accurate.
              </Label>
            </div>
            <FormError message={errors.declarationAccurate?.message} />
            <div className="flex gap-3">
              <Checkbox
                checked={editRestriction}
                id="declaration-edit-restriction"
                onCheckedChange={(checked) => form.setValue("declarationEditRestriction", checked === true, { shouldValidate: true })}
              />
              <Label className="font-normal leading-5" htmlFor="declaration-edit-restriction">
                I understand that after submitting my application, I may not be able to edit some information.
              </Label>
            </div>
            <FormError message={errors.declarationEditRestriction?.message} />

            <Button className="w-full sm:w-auto" disabled={!accurate || !editRestriction} onClick={handleSubmitClick} type="button">
              Submit Application
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open && !isPending) {
            setConfirmOpen(false);
            setSubmitError(undefined);
            onStatusChange("ready-to-submit");
          }
        }}
        open={confirmOpen}
      >
        <AlertDialogContent>
          {submitError ? (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Unable to submit application</AlertDialogTitle>
                <AlertDialogDescription>
                  We couldn&apos;t submit your application. Your information has been saved. Please try again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <p className="text-sm font-medium text-destructive" role="alert">{submitError}</p>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Close</AlertDialogCancel>
                <AlertDialogAction
                  aria-busy={isPending}
                  disabled={isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    handleConfirmSubmit();
                  }}
                >
                  {isPending ? "Submitting…" : "Try Again"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm submit application</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to submit your application for {form.getValues("role") || "this position"}? Please check that all of your information is
                  correct before submitting. After submission, you may not be able to make changes to this application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Go Back</AlertDialogCancel>
                <AlertDialogAction
                  aria-busy={isPending}
                  disabled={isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    handleConfirmSubmit();
                  }}
                >
                  {isPending ? "Submitting…" : "Confirm Submit"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Confirmation({
  applicationId,
  onDashboard,
  onSubmission,
  submission,
}: {
  applicationId: string;
  onDashboard: () => void;
  onSubmission: (result: SubmissionResult) => void;
  submission: SubmissionResult;
}) {
  const router = useRouter();
  const [isResending, startResend] = useTransition();
  const { reference, submittedAt, email, emailDelivered, jobTitle, location } = submission;

  function handleResend() {
    startResend(async () => {
      const result = await resendConfirmationEmailAction(applicationId, { email, jobTitle, reference });
      onSubmission({ ...submission, emailDelivered: result.success });
      if (result.success) toast.success("Confirmation email sent");
      else toast.error("We couldn't send the confirmation email. Please try again.");
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-5">
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="size-7" />
          </span>
          <CardTitle className="mt-4 font-serif text-3xl">Thank you!</CardTitle>
          <CardDescription>Your application has been successfully submitted. We&apos;ve received your application.</CardDescription>
          <p className="text-sm text-muted-foreground">
            Please check your inbox for your application confirmation and reference number.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <Card className="bg-stone-50">
            <CardHeader>
              <CardTitle className="text-base">Application submitted</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Job</p>
                <p className="mt-1 font-semibold">{jobTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="mt-1 font-semibold">{location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Application reference</p>
                <p className="mt-1 font-mono font-semibold">{reference}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="mt-1 font-semibold">{format(new Date(submittedAt), "d MMMM yyyy")}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="mt-1"><StatusBadge status="submitted" /></p>
              </div>
            </CardContent>
          </Card>

          {emailDelivered ? (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Mail />
              <AlertTitle>Confirmation email sent</AlertTitle>
              <AlertDescription>
                We&apos;ve sent confirmation that we received your application to:
                <p className="mt-1 font-mono font-medium text-foreground">{maskEmail(email)}</p>
                <p className="mt-1">Please keep this email for your records.</p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle />
              <AlertTitle>Application received</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>Your application was submitted successfully, but we couldn&apos;t send your confirmation email.</p>
                <p>
                  Your application reference is: <span className="font-mono font-medium text-foreground">{reference}</span>
                </p>
                <p>Please keep this reference for your records.</p>
                <Button disabled={isResending} onClick={handleResend} size="sm" variant="outline">
                  {isResending ? "Sending…" : "Resend confirmation email"}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <Info />
            <AlertTitle>What happens next?</AlertTitle>
            <AlertDescription>
              The recruitment team will review your application. We&apos;ll contact you using the contact details you
              provided if there is an update or if we need any additional information.
            </AlertDescription>
          </Alert>
          <div className="grid gap-3">
            <Button onClick={() => router.push(`/applications/${applicationId}/submitted`)} variant="outline">View Submitted Application</Button>
            <Button onClick={() => { onDashboard(); router.push("/dashboard"); }}>Return to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
