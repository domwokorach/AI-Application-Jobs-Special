"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarIcon, CheckCircle2, ChevronDown, CircleUserRound, Download, FileText, GraduationCap, Info, Mail, MapPin, Paperclip, Plus, Trash2, UploadCloud } from "lucide-react";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, useWatch, type FieldErrors, type Path } from "react-hook-form";
import { ApplicationShell } from "./application-shell";
import { applicationSteps } from "@/constants/application-steps";
import { applicationSchema, type ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import { defaultAboutYouFieldConfiguration, PERSONAL_PROFILE_MAX_LENGTH, ROLE_INTEREST_MAX_LENGTH } from "@/features/applications/schemas/about-you.schema";
import { CharacterLimitTextarea } from "@/features/applications/components/character-limit-textarea";
import { LanguageSelector } from "@/features/applications/components/language-selector";
import { DEFAULT_MAX_LANGUAGE_SELECTIONS, type LanguageSelection } from "@/features/applications/schemas/languages.schema";
import { saveApplicationStepAction } from "@/features/applications/actions/save-application-step.actions";
import { useAutosave } from "@/hooks/use-autosave";
import { regeneratePdfAction, resendConfirmationEmailAction, submitApplicationAction } from "@/features/applications/actions/submit-application.actions";
import type { ApplicationSummary, DocumentStatus } from "@/features/applications/services/applications.service";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { RecentActivity } from "@/components/application/recent-activity";
import { CandidatePrivacyNotice } from "@/components/privacy/candidate-privacy-notice";
import type { ApplicationStatus } from "@/types";

type Values = ApplicationFormValues;

const APPLICATION_ID = "demo-application";
type SubmissionResult = {
  reference: string;
  submittedAt: string;
  email: string;
  jobTitle: string;
  location?: string;
  summary: ApplicationSummary;
  emailDelivered: boolean;
  pdfStatus: DocumentStatus;
};

const validationStepOrder: Array<{ field: keyof Values; step: number }> = [
  { field: "fullName", step: 1 },
  { field: "email", step: 1 },
  { field: "mobile", step: 1 },
  { field: "dateOfBirth", step: 1 },
  { field: "address", step: 1 },
  { field: "postcode", step: 1 },
  { field: "role", step: 2 },
  { field: "personalProfile", step: 3 },
  { field: "roleInterest", step: 3 },
  { field: "work", step: 5 },
  { field: "education", step: 8 },
  { field: "references", step: 12 },
  { field: "declarationAccurate", step: 13 },
  { field: "declarationEditRestriction", step: 13 },
];

const jobRoleOptions = [
  "Software Engineer", "Data Analyst", "Lead Software Engineer", "Senior Software Engineer",
  "Front-End Developer", "Back-End Developer", "Full-Stack Developer", "DevOps Engineer",
  "Cyber Security Specialist", "Project Manager", "Product Manager", "Business Analyst", "Legal",
  "Finance", "Human Resources", "Marketing", "Customer Service", "Operations", "Other",
];
const locationOptions = [
  "London", "Manchester", "Birmingham", "Leeds", "Liverpool", "Bristol", "Sheffield", "Newcastle",
  "Nottingham", "Cardiff", "Edinburgh", "Glasgow", "Belfast", "Remote — UK", "Hybrid — UK", "Other UK Location",
];
const employerOptions = [
  "Lloyds Banking Group", "Sky", "BBC", "ITV", "Barclays", "HSBC", "NatWest Group", "BT Group",
  "Vodafone", "Amazon UK", "Google UK", "Microsoft UK", "Other",
];
const employmentTypeOptions = [
  "Permanent", "Full-time", "Part-time", "Fixed-term Contract", "Temporary", "Contract",
  "Internship", "Apprenticeship", "Graduate Scheme", "Other",
];

function pdfFilename(reference: string): string {
  return `application-${reference.replace(/[^A-Za-z0-9-]/g, "")}.pdf`;
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  return `${local[0]}${"•".repeat(Math.max(local.length - 1, 4))}@${domain}`;
}

function Field({ children, label, hint, error, required = false }: { children: React.ReactNode; label: string; hint?: string; error?: string; required?: boolean }) {
  const id = label.toLowerCase().replaceAll(/[^a-z0-9]/g, "-");
  return <div className={`space-y-2 ${error ? "[&_input]:border-destructive [&_textarea]:border-destructive [&_[data-slot=button]]:border-destructive [&_[data-slot=select-trigger]]:border-destructive" : ""}`}><Label htmlFor={id}>{label}{required && <span className="text-destructive"> *</span>}</Label>{children}{hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}{error && <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-destructive" role="alert"><AlertCircle className="size-3.5" />{error}</p>}</div>;
}

function DatePickerField({ label }: { label: string }) {
  const [date, setDate] = useState<Date>();
  return <Field label={label}><Popover><PopoverTrigger asChild><Button className="w-full justify-start font-normal" variant="outline"><CalendarIcon className="mr-2 size-4" />{date ? format(date, "PPP") : "Choose a date"}</Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" onSelect={setDate} selected={date} /></PopoverContent></Popover></Field>;
}

function SearchableSelect({
  ariaLabel,
  onValueChange,
  options,
  placeholder,
  value,
}: {
  ariaLabel: string;
  onValueChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const filteredOptions = options.filter((option) => option.toLocaleLowerCase().includes(query.toLocaleLowerCase()));

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button aria-expanded={open} aria-haspopup="listbox" aria-label={ariaLabel} className="w-full justify-between font-normal" type="button" variant="outline">
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(22rem,calc(100vw-2rem))] p-2">
        <Input aria-label={`Search ${ariaLabel.toLowerCase()}`} autoFocus onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${ariaLabel.toLowerCase()}`} value={query} />
        <div className="mt-2 max-h-56 overflow-y-auto" role="listbox">
          {filteredOptions.length > 0 ? filteredOptions.map((option) => (
            <Button
              aria-selected={value === option}
              className="w-full justify-start font-normal"
              key={option}
              onClick={() => {
                onValueChange(option);
                setOpen(false);
                setQuery("");
              }}
              role="option"
              type="button"
              variant="ghost"
            >
              {option}
            </Button>
          )) : <p className="px-3 py-2 text-sm text-muted-foreground">No matching options.</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
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
    {file ? <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="grid size-11 place-items-center rounded-md bg-secondary text-secondary-foreground"><FileText className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB · Upload complete</p><Progress className="mt-2 h-1.5" value={progress} /></div><div className="flex gap-2"><Button onClick={() => input.current?.click()} size="sm" variant="outline">Replace</Button><Button onClick={() => { setFile(undefined); setProgress(0); }} size="icon-sm" variant="ghost" aria-label="Remove uploaded CV"><Trash2 /></Button></div></div> : <div className="grid justify-items-center py-7 text-center" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}><span className="mb-3 grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground"><UploadCloud className="size-5" /></span><h2 className="text-sm font-semibold">Drag and drop your CV here</h2><p className="mt-1 text-xs text-muted-foreground">PDF, DOC or DOCX · Maximum file size 10MB</p><Button className="mt-4" onClick={() => input.current?.click()} type="button" variant="outline"><Paperclip />Browse files</Button></div>}
    <input className="sr-only" accept=".pdf,.doc,.docx" onChange={(event) => chooseFile(event.target.files?.[0])} ref={input} type="file" />
  </CardContent></Card>;
}

function RepeatableCards({ control, errors, register, kind }: { control: ReturnType<typeof useForm<Values>>["control"]; errors: FieldErrors<Values>; register: ReturnType<typeof useForm<Values>>["register"]; kind: "work" | "education" | "references" }) {
  const { fields, append, remove } = useFieldArray({ control, name: kind });
  const config = kind === "work"
    ? { title: "Work experience", icon: BriefcaseBusiness, empty: { title: "", employer: "" }, inputs: [{ label: "Job title", name: "title" }, { label: "Employer", name: "employer" }] }
    : kind === "education"
    ? { title: "Education and qualifications", icon: GraduationCap, empty: { institution: "", qualification: "" }, inputs: [{ label: "Institution", name: "institution" }, { label: "Qualification", name: "qualification" }] }
    : { title: "References", icon: CircleUserRound, empty: { name: "", email: "" }, inputs: [{ label: "Reference name", name: "name" }, { label: "Email address", name: "email" }] };
  const Icon = config.icon;
  return <div className="space-y-4">{fields.map((item, index) => <Card key={item.id}><CardHeader className="flex-row items-center justify-between space-y-0 pb-4"><CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4 text-foreground" />{config.title} {index + 1}</CardTitle>{fields.length > 1 && <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost"><Trash2 />Remove</Button>}</CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{config.inputs.map((field) => <Field error={getRepeatableFieldError(errors, kind, index, field.name)} key={field.name} label={field.label}><Input aria-invalid={Boolean(getRepeatableFieldError(errors, kind, index, field.name))} placeholder={`Enter ${field.label.toLowerCase()}`} {...register(`${kind}.${index}.${field.name}` as Path<Values>)} /></Field>)}</CardContent></Card>)}<Button onClick={() => append(config.empty as never)} type="button" variant="outline"><Plus />Add another</Button></div>;
}

function getRepeatableFieldError(errors: FieldErrors<Values>, kind: "work" | "education" | "references", index: number, field: string): string | undefined {
  if (kind === "work") {
    return field === "title" ? errors.work?.[index]?.title?.message : errors.work?.[index]?.employer?.message;
  }
  if (kind === "education") {
    return field === "institution" ? errors.education?.[index]?.institution?.message : errors.education?.[index]?.qualification?.message;
  }
  return field === "name" ? errors.references?.[index]?.name?.message : errors.references?.[index]?.email?.message;
}

function Dashboard({
  applicationId,
  onContinue,
  status,
  submission,
}: {
  applicationId: string;
  onContinue: () => void;
  status: ApplicationStatus;
  submission?: SubmissionResult;
}) {
  const submitted = status === "submitted";
  return <div className="min-h-screen bg-background"><header className="border-b bg-background"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5"><div className="flex items-center gap-2 font-serif text-2xl font-semibold"><span className="grid size-8 place-items-center rounded-full bg-primary font-sans text-xs text-primary-foreground">AI</span>AI Application Fast Specialist</div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost"><CircleUserRound />Alex Morgan<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>Profile settings</DropdownMenuItem><DropdownMenuItem>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14"><p className="text-sm font-medium text-foreground">Good afternoon, Alex</p><h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Your applications</h1><div className="mt-9 grid gap-6 lg:grid-cols-[1.6fr_1fr]"><Card><CardHeader><div className="flex items-start justify-between gap-3"><div><StatusBadge status={status} /><CardTitle className="mt-3 font-serif text-2xl">{submission?.jobTitle || "Application"}</CardTitle><CardDescription className="mt-2 flex items-center gap-1"><MapPin className="size-3.5" />{submission?.location || "Location not specified"}</CardDescription></div><BriefcaseBusiness className="size-6 text-foreground" /></div></CardHeader><CardContent><Separator />
      {submitted && submission ? (
        <div className="mt-5 space-y-1 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-foreground"><CheckCircle2 className="size-4" />Application submitted</p>
          <p className="text-muted-foreground">Reference: <span className="font-mono font-medium text-foreground">{submission.reference}</span></p>
          <p className="text-muted-foreground">Submitted: {format(new Date(submission.submittedAt), "d MMMM yyyy")}</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">Application progress</p><div className="mt-2 flex items-center gap-3"><Progress className="w-48" value={36} /><span className="text-sm font-semibold">5 of {applicationSteps.length} sections</span></div></div><p className="text-xs text-muted-foreground">Last saved today, 14:32</p></div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">{submitted ? <><Button onClick={onContinue} variant="outline">View Application</Button><Button asChild variant="outline"><a download={submission ? pdfFilename(submission.reference) : undefined} href={`/applications/${applicationId}/pdf`}><Download />Download PDF</a></Button></> : <><Button onClick={onContinue}>Continue application <ArrowRight /></Button><Button onClick={onContinue} variant="outline">View application</Button></>}</div></CardContent></Card>
      <Card><CardHeader><CardTitle>Profile summary</CardTitle><CardDescription>Keep your details up to date to make applying faster.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground">AM</span><div><p className="text-sm font-semibold">Alex Morgan</p><p className="text-xs text-muted-foreground">alex.morgan@example.com</p></div></div><Separator /><p className="text-sm text-muted-foreground">Your profile is 80% complete.</p><Button className="w-full" variant="outline">Manage profile</Button></CardContent></Card></div>
      {submitted ? <RecentActivity applicationId={applicationId} /> : <section className="mt-10"><h2 className="font-serif text-2xl">Recent activity</h2><Card className="mt-4"><CardContent className="flex items-center gap-3 p-5"><CheckCircle2 className="size-5 text-foreground" /><div><p className="text-sm font-medium">Personal details saved</p><p className="text-xs text-muted-foreground">Today at 14:32</p></div></CardContent></Card></section>}</main></div>;
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
  // Only jump straight to the full confirmation page when the app was loaded
  // already-submitted (e.g. visiting /submitted directly). A fresh in-session
  // submit instead shows a confirmation pop-up over the review step.
  const [showFullConfirmationOnLoad] = useState(() => initialScreen === "form" && Boolean(initialSubmission));
  const form = useForm<Values>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      mobile: "",
      dateOfBirth: "",
      address: "",
      postcode: "",
      role: "",
      location: "",
      preferredEmployer: "",
      employmentType: undefined,
      availableFrom: "",
      personalProfile: initialSubmission?.summary.aboutYou.personalProfile ?? "",
      roleInterest: initialSubmission?.summary.aboutYou.roleInterest ?? "",
      languages: initialSubmission?.summary.languages ?? [],
      adjustments: undefined,
      adjustmentDetails: "",
      ageGroup: "",
      sex: "",
      genderIdentity: "",
      ethnicity: "",
      religion: "",
      sexualOrientation: "",
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
      const valid = await form.trigger(["fullName", "email", "mobile", "dateOfBirth", "address", "postcode"]);
      if (!valid) {
        toast.error("Please correct the highlighted fields.");
        return;
      }
    }
    if (current === 3) {
      const valid = await form.trigger(["personalProfile", "roleInterest"]);
      if (!valid) {
        toast.error("Please correct the highlighted fields.");
        return;
      }
      const saved = await saveApplicationStepAction(APPLICATION_ID, "about-you", {
        personalProfile: form.getValues("personalProfile"),
        roleInterest: form.getValues("roleInterest"),
      });
      if (!saved.success) {
        toast.error("We couldn't save your answers. Please try again.");
        return;
      }
    }
    if (current === 7) {
      const saved = await saveApplicationStepAction(APPLICATION_ID, "languages", {
        languages: form.getValues("languages"),
      });
      if (!saved.success) {
        toast.error("We couldn't save your languages. Please try again.");
        return;
      }
    }
    setCurrent((value) => value + 1);
    toast.success("Changes saved");
  }

  if (screen === "dashboard") {
    return (
      <Dashboard
        applicationId={APPLICATION_ID}
        onContinue={() => { setScreen("form"); setCurrent(applicationSteps.length - 1); }}
        status={applicationStatus}
        submission={submission}
      />
    );
  }
  if (applicationStatus === "submitted" && submission && showFullConfirmationOnLoad) {
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
    <FormProvider {...form}>
      <ApplicationShell current={current} onSelect={setCurrent} steps={applicationSteps}>
        <main className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8 sm:pt-16">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Step {current + 1} of {applicationSteps.length}</p>
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
          <nav className="fixed inset-x-0 bottom-0 z-10 flex min-h-18 items-center justify-between border-t bg-background/95 px-5 py-3 backdrop-blur md:static md:mt-10 md:border-b md:bg-transparent md:px-0">
            <Button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} variant="ghost"><ArrowLeft />Previous</Button>
            {!isLastStep && <Button onClick={next}>Save and continue<ArrowRight /></Button>}
          </nav>
        </FormSection>
        </main>
      </ApplicationShell>
    </FormProvider>
  );
}

function descriptionFor(id: string) { return ({ account: "Create an account to securely save your application and return whenever you need.", "personal-details": "Please provide the details we need to contact you about your application.", "job-preferences": "Tell us which role and working arrangements are the best fit for you.", "about-you": "Share a short introduction and why this opportunity interests you.", cv: "Upload your CV in PDF, DOC or DOCX format. You can still complete this application without one.", experience: "Add your employment history. If you have no previous experience, leave this section blank.", skills: "Add skills, licences and professional qualifications relevant to this role.", languages: "Select the spoken or signed languages you can communicate in. This section is optional.", education: "Tell us about your education and qualifications.", "right-to-work": "We need to confirm your eligibility to work in the UK.", adjustments: "Tell us how we can make the recruitment process accessible and supportive for you.", "equality-diversity": "Help us understand whether our recruitment is fair and inclusive.", references: "Add people who can comment on your work or character.", review: "Review your application, then confirm the declaration to submit it." } as Record<string, string>)[id]; }

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
  if ([5, 8, 12].includes(current)) return <RepeatableCards control={control} errors={errors} kind={current === 5 ? "work" : current === 8 ? "education" : "references"} register={form.register} />;
  if (current === 10) return <Adjustments form={form} />;
  if (current === 11) return <Equality form={form} />;
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
  if (current === 9) return <div className="grid gap-6"><Field label="Do you currently have the right to work in the UK?" required><RadioGroup defaultValue="yes"><div className="flex items-center gap-2"><RadioGroupItem id="right-yes" value="yes" /><Label htmlFor="right-yes">Yes, without restrictions</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-visa" value="visa" /><Label htmlFor="right-visa">Yes, with a current visa</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-no" value="no" /><Label htmlFor="right-no">No</Label></div></RadioGroup></Field><Field label="Will you require visa sponsorship?" required><Select><SelectTrigger><SelectValue placeholder="Choose an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></Field></div>;
  if (current === 1) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" error={errors.fullName?.message} required><Input aria-describedby={errors.fullName ? "full-name-error" : undefined} {...form.register("fullName")} placeholder="Enter your full name" /></Field><Field label="Email address" error={errors.email?.message} required><Input {...form.register("email")} placeholder="you@example.com" type="email" /></Field><Field label="Mobile number" error={errors.mobile?.message} required><Input {...form.register("mobile")} placeholder="07123 456789" type="tel" /></Field><Field label="Date of birth" error={errors.dateOfBirth?.message} hint="You must be 18 years old or over. Enter your date of birth as DD/MM/YY." required><Input autoComplete="bday" inputMode="numeric" maxLength={8} pattern="\d{2}/\d{2}/\d{2}" placeholder="DD/MM/YY" {...form.register("dateOfBirth")} /></Field><Field label="Home address" error={errors.address?.message} required><Input {...form.register("address")} placeholder="Start typing your address" /></Field><Field label="Postcode" error={errors.postcode?.message} required><Input {...form.register("postcode")} placeholder="e.g. SW1A 1AA" /></Field></div>;
  if (current === 0) return <div className="grid gap-5"><Field label="Email address" required><Input placeholder="you@example.com" type="email" /></Field><Field label="Create password" hint="Use at least 12 characters." required><Input type="password" /></Field><Field label="Confirm password" required><Input type="password" /></Field></div>;
  if (current === 2) return <div className="grid gap-5 sm:grid-cols-2">
    <Field error={errors.role?.message} label="Job or role you are applying for" required>
      <Controller control={form.control} name="role" render={({ field }) => <SearchableSelect ariaLabel="Job or role you are applying for" onValueChange={field.onChange} options={jobRoleOptions} placeholder="Select a role" value={field.value} />} />
    </Field>
    <Field label="Preferred location">
      <Controller control={form.control} name="location" render={({ field }) => <SearchableSelect ariaLabel="Preferred location" onValueChange={field.onChange} options={locationOptions} placeholder="Select a UK location" value={field.value} />} />
    </Field>
    <Field label="Preferred employer / company">
      <Controller control={form.control} name="preferredEmployer" render={({ field }) => <SearchableSelect ariaLabel="Preferred employer or company" onValueChange={field.onChange} options={employerOptions} placeholder="Select an employer" value={field.value} />} />
    </Field>
    <Field label="Employment type">
      <Controller control={form.control} name="employmentType" render={({ field }) => <SearchableSelect ariaLabel="Employment type" onValueChange={field.onChange} options={employmentTypeOptions} placeholder="Select employment type" value={field.value} />} />
    </Field>
    <DatePickerField label="Available start date" />
  </div>;
  if (current === 3) return <AboutYouFields applicationId={applicationId} disabled={applicationStatus === "submitted"} />;
  if (current === 7) return <LanguagesFields applicationId={applicationId} disabled={applicationStatus === "submitted"} />;
  return <div className="grid gap-5 sm:grid-cols-2"><Field label="Key skills"><Input placeholder="e.g. Customer service, Excel, teamwork" /></Field><Field label="Driving licence"><Select><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="na">Not applicable</SelectItem></SelectContent></Select></Field><Field label="Professional qualifications"><Input placeholder="Add relevant certificates" /></Field></div>;
}

function AboutYouFields({ applicationId, disabled }: { applicationId: string; disabled: boolean }) {
  const { control } = useFormContext<Values>();
  const [personalProfile = "", roleInterest = ""] = useWatch({
    control,
    name: ["personalProfile", "roleInterest"],
  });
  const values = useMemo(() => ({ personalProfile, roleInterest }), [personalProfile, roleInterest]);
  const autosaveStatus = useAutosave(
    values,
    async (answers) => {
      const result = await saveApplicationStepAction(applicationId, "about-you", answers);
      if (!result.success) throw new Error("Unable to save");
    },
    800,
    !disabled,
  );
  const statusMessage = autosaveStatus === "saving"
    ? "Saving…"
    : autosaveStatus === "saved"
      ? "✓ Saved"
      : autosaveStatus === "error"
        ? "Unable to save"
        : "";

  return (
    <div className="space-y-6">
      <CharacterLimitTextarea
        description="Tell us briefly about yourself, your experience, key strengths and what you could bring to this role."
        disabled={disabled}
        label="Personal Profile"
        maxLength={PERSONAL_PROFILE_MAX_LENGTH}
        name="personalProfile"
        required={defaultAboutYouFieldConfiguration.personalProfile.required}
        rows={6}
      />
      <CharacterLimitTextarea
        description="Tell us why you're interested in this position and how your experience, skills and motivation relate to the role."
        disabled={disabled}
        label="Why are you interested in this role?"
        maxLength={ROLE_INTEREST_MAX_LENGTH}
        name="roleInterest"
        required={defaultAboutYouFieldConfiguration.roleInterest.required}
        rows={10}
      />
      <div aria-live="polite" className="min-h-5 text-sm">
        {statusMessage && (
          <p className={autosaveStatus === "error" ? "font-medium text-destructive" : "text-muted-foreground"}>
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function LanguagesFields({ applicationId, disabled }: { applicationId: string; disabled: boolean }) {
  const { control } = useFormContext<Values>();
  const languages = useWatch({ control, name: "languages" }) ?? [];
  const autosaveStatus = useAutosave(
    languages,
    async (savedLanguages) => {
      const result = await saveApplicationStepAction(applicationId, "languages", { languages: savedLanguages });
      if (!result.success) throw new Error("Unable to save");
    },
    800,
    !disabled,
  );
  const statusMessage = autosaveStatus === "saving"
    ? "Saving…"
    : autosaveStatus === "saved"
      ? "✓ Saved"
      : autosaveStatus === "error"
        ? "Unable to save"
        : "";

  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="languages"
        render={({ field }) => (
          <LanguageSelector
            disabled={disabled}
            maxSelections={DEFAULT_MAX_LANGUAGE_SELECTIONS}
            onChange={field.onChange}
            showProficiency
            value={field.value}
          />
        )}
      />
      <div aria-live="polite" className="min-h-5 text-sm">
        {statusMessage && <p className={autosaveStatus === "error" ? "font-medium text-destructive" : "text-muted-foreground"}>{statusMessage}</p>}
      </div>
    </div>
  );
}

function Adjustments({ form }: { form: ReturnType<typeof useForm<Values>> }) {
  const choice = useWatch({ control: form.control, name: "adjustments" });
  const options = ["Visual impairment support", "Deaf or hard-of-hearing support", "Mobility or physical accessibility", "Learning disability support", "Neurodivergence-related adjustment", "Communication support", "Accessible interview location", "Extra assessment time", "Other"];
  return <div className="space-y-6"><Alert className="border-border bg-muted"><Info /><AlertTitle>Confidential information</AlertTitle><AlertDescription>This information will be handled confidentially and, where practicable, separately from the information used to assess your application.</AlertDescription></Alert><Field label="Do you require any reasonable adjustments or additional support during the recruitment process?"><Controller control={form.control} name="adjustments" render={({ field }) => <RadioGroup onValueChange={field.onChange} value={field.value}><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-yes" value="yes" /><Label htmlFor="adjustments-yes">Yes</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-no" value="no" /><Label htmlFor="adjustments-no">No</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-discuss" value="discuss" /><Label htmlFor="adjustments-discuss">Prefer to discuss</Label></div></RadioGroup>} /></Field>{choice === "yes" && <div className="space-y-5 rounded-lg border bg-background p-5"><p className="text-sm font-medium">Select any support that would be helpful.</p><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <label className="flex min-h-7 items-center gap-2 text-sm" key={option}><Checkbox />{option}</label>)}</div><Field label="Please tell us what adjustment or support would help you"><Textarea {...form.register("adjustmentDetails")} placeholder="For example, extra time for an assessment or an accessible interview location." rows={5} /></Field></div>}</div>;
}

function Equality({ form }: { form: ReturnType<typeof useForm<Values>> }) {
  return (
    <div className="space-y-6">
      <Alert className="border-border bg-muted">
        <Info />
        <AlertTitle>Optional equality and diversity monitoring</AlertTitle>
        <AlertDescription>Providing this information is optional. It is used for equality and diversity monitoring and is not used to assess your application.</AlertDescription>
      </Alert>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field error={form.formState.errors.ageGroup?.message} hint="Optional. Enter a whole number from 18 to 99." label="Age group">
          <Controller control={form.control} name="ageGroup" render={({ field }) => (
            <Input
              inputMode="numeric"
              max={99}
              min={18}
              onChange={field.onChange}
              placeholder="18–99"
              step={1}
              type="number"
              value={field.value}
            />
          )} />
        </Field>
        <EqualitySelect form={form} label="Sex" name="sex" options={["Male", "Female", "Intersex", "Other", "Prefer not to say"]} />
        <EqualitySelect form={form} label="Gender identity" name="genderIdentity" options={["Woman", "Man", "Non-binary", "Another identity", "Prefer not to say"]} />
        <EqualitySelect form={form} label="Race or ethnicity" name="ethnicity" options={["Asian or Asian British", "Black, African, Caribbean or Black British", "Mixed or multiple ethnic groups", "White", "Another ethnic group", "Prefer not to say"]} />
        <EqualitySelect form={form} label="Religion or belief" name="religion" options={["No religion or belief", "Buddhist", "Christian", "Hindu", "Jewish", "Muslim", "Sikh", "Another religion or belief", "Prefer not to say"]} />
        <EqualitySelect form={form} label="Sexual orientation" name="sexualOrientation" options={["Heterosexual or straight", "Gay or lesbian", "Bisexual", "Another sexual orientation", "Prefer not to say"]} />
      </div>
    </div>
  );
}

function EqualitySelect({
  form,
  label,
  name,
  options,
}: {
  form: ReturnType<typeof useForm<Values>>;
  label: string;
  name: "sex" | "genderIdentity" | "ethnicity" | "religion" | "sexualOrientation";
  options: string[];
}) {
  return (
    <Field label={label}>
      <Controller control={form.control} name={name} render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
          </SelectContent>
        </Select>
      )} />
    </Field>
  );
}

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
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [submittedResult, setSubmittedResult] = useState<SubmissionResult>();
  const [isPending, startTransition] = useTransition();
  const accurate = useWatch({ control: form.control, name: "declarationAccurate" });
  const editRestriction = useWatch({ control: form.control, name: "declarationEditRestriction" });
  const personalProfile = useWatch({ control: form.control, name: "personalProfile" });
  const roleInterest = useWatch({ control: form.control, name: "roleInterest" });
  const languages = useWatch({ control: form.control, name: "languages" });
  const isSubmitted = applicationStatus === "submitted";

  const sections = [
    { label: "Personal details", step: 1 },
    { label: "Job preferences", step: 2 },
    { label: "Work experience", step: 5 },
    { label: "Skills", step: 6 },
    { label: "Education", step: 8 },
    { label: "Right to work", step: 9 },
    { label: "Reasonable adjustments", step: 10 },
    { label: "References", step: 12 },
  ];

  function handleSubmitClick() {
    form.handleSubmit(
      () => {
        onStatusChange("ready-to-submit");
        setConfirmOpen(true);
      },
      (invalidFields) => {
        const firstInvalidStep = validationStepOrder.find(({ field }) => invalidFields[field])?.step;
        onEdit(firstInvalidStep ?? 1);
        toast.error("Please complete all required sections before submitting.");
      },
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
      const submissionResult: SubmissionResult = {
        reference: result.reference,
        submittedAt: result.submittedAt,
        email: result.email,
        jobTitle: result.jobTitle,
        location: result.location,
        summary: result.summary,
        emailDelivered: result.emailDelivered,
        pdfStatus: result.pdfStatus,
      };
      onStatusChange("submitted");
      setConfirmOpen(false);
      onSubmitted(submissionResult);
      setSubmittedResult(submissionResult);
    });
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info />
        <AlertTitle>Almost ready to submit</AlertTitle>
        <AlertDescription>Complete your declaration below before submitting. Optional equality monitoring is not included in this review.</AlertDescription>
      </Alert>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium">About you</p>
            <Button disabled={isSubmitted} onClick={() => onEdit(3)} variant="outline">Edit</Button>
          </div>
          <dl className="mt-5 space-y-5">
            <ReviewAnswer label="Personal Profile" value={personalProfile} />
            <ReviewAnswer label="Why are you interested in this role?" value={roleInterest} />
          </dl>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-medium">Languages</p>
            <Button disabled={isSubmitted} onClick={() => onEdit(7)} variant="outline">Edit</Button>
          </div>
          {languages.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Not provided</p>
          ) : (
            <dl className="mt-5 space-y-4">
              {languages.map((language) => <ReviewLanguage key={language.code} language={language} />)}
            </dl>
          )}
        </CardContent>
      </Card>
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
              <Controller
                control={form.control}
                name="declarationAccurate"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    id="declaration-accurate"
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
              <Label className="font-normal leading-5" htmlFor="declaration-accurate">
                I confirm that the information provided in this application is complete and accurate.
              </Label>
            </div>
            <FormError message={errors.declarationAccurate?.message} />
            <div className="flex gap-3">
              <Controller
                control={form.control}
                name="declarationEditRestriction"
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    id="declaration-edit-restriction"
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
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
                  Are you sure you want to submit your application? Please check that all of your information is correct
                  before submitting. After submission, you may not be able to make changes.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {isPending && (
                <div aria-live="polite" className="rounded-md bg-muted px-4 py-3 text-sm">
                  <p className="font-medium">Submitting application…</p>
                  <p className="mt-1 text-muted-foreground">Please do not close this page.</p>
                </div>
              )}
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

      <Dialog open={Boolean(submittedResult)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <CheckCircle2 className="size-5" />
            </span>
            <DialogTitle className="mt-2 text-lg">Application submitted successfully</DialogTitle>
            <DialogDescription>
              We&apos;ve received your application. A confirmation email will be sent to you with a copy of your
              application, a PDF, and your application reference number for your personal records. Please keep the
              reference number safe, as you may need it for any future enquiries about your application.
            </DialogDescription>
          </DialogHeader>
          {submittedResult && (
            <p className="text-sm text-muted-foreground">
              Reference: <span className="font-mono font-medium text-foreground">{submittedResult.reference}</span>
            </p>
          )}
          <DialogFooter>
            {submittedResult && (
              <Button asChild variant="outline">
                <a download={pdfFilename(submittedResult.reference)} href={`/applications/${applicationId}/pdf`}>
                  <Download />
                  Download PDF
                </a>
              </Button>
            )}
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReviewAnswer({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <dt className="font-medium">{label}</dt>
      <dd className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{value || "Not provided"}</dd>
    </div>
  );
}

function ReviewLanguage({ language }: { language: LanguageSelection }) {
  return (
    <div className="border-t pt-4 first:border-t-0 first:pt-0">
      <dt className="font-medium">{language.name}</dt>
      <dd className="mt-1 text-sm text-muted-foreground">{formatLanguageProficiency(language.proficiency)}</dd>
    </div>
  );
}

function formatLanguageProficiency(proficiency?: LanguageSelection["proficiency"]) {
  const labels = {
    BASIC: "Basic",
    CONVERSATIONAL: "Conversational",
    PROFESSIONAL: "Professional working proficiency",
    FLUENT: "Fluent",
    NATIVE: "Native / First language",
  };
  return proficiency ? labels[proficiency] : "Proficiency not provided";
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
  const [isRetryingPdf, startPdfRetry] = useTransition();
  const [downloadStarted, setDownloadStarted] = useState(false);
  const { reference, submittedAt, email, emailDelivered, jobTitle, location, pdfStatus } = submission;
  const pdfUrl = `/applications/${applicationId}/pdf`;
  const filename = pdfFilename(reference);

  const statusMessage = downloadStarted
    ? "Your PDF download has started."
    : pdfStatus === "READY"
      ? "Your application PDF is ready."
      : pdfStatus === "FAILED"
        ? "We couldn't prepare your application PDF."
        : pdfStatus === "GENERATING"
          ? "Preparing your application PDF."
          : "Application submitted.";

  function triggerDownload() {
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadStarted(true);
  }

  function handleResend() {
    startResend(async () => {
      const result = await resendConfirmationEmailAction(applicationId, { email, jobTitle, reference });
      onSubmission({ ...submission, emailDelivered: result.success });
      if (result.success) toast.success("Confirmation email sent");
      else toast.error("We couldn't send the confirmation email. Please try again.");
    });
  }

  function handleRetryPdf() {
    startPdfRetry(async () => {
      const result = await regeneratePdfAction(applicationId);
      onSubmission({ ...submission, pdfStatus: result.status });
      if (result.status === "READY") {
        toast.success("Your application PDF is ready");
        triggerDownload();
      } else {
        toast.error("We still couldn't prepare your PDF. Please try again.");
      }
    });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <div aria-live="polite" className="sr-only" role="status">{statusMessage}</div>
      <Card className="w-full max-w-xl">
        <CardHeader className="items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <CheckCircle2 className="size-7" />
          </span>
          <CardTitle className="mt-4 font-serif text-3xl">Thank you!</CardTitle>
          <CardDescription>Your application has been successfully submitted. We&apos;ve received your application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Card className="bg-muted">
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

          <CandidatePrivacyNotice />

          {pdfStatus === "FAILED" ? (
            <Alert className="border-border bg-muted">
              <AlertCircle />
              <AlertTitle>We couldn&apos;t prepare your PDF confirmation</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>Your application is still safely submitted. Only your PDF confirmation failed to generate.</p>
                <p>
                  Your application reference is: <span className="font-mono font-medium text-foreground">{reference}</span>
                </p>
                <Button disabled={isRetryingPdf} onClick={handleRetryPdf} size="sm" variant="outline">
                  {isRetryingPdf ? "Trying again…" : "Try Download Again"}
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-border bg-muted">
              <FileText />
              <AlertTitle>Your application confirmation PDF is ready</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>Please keep it for your records.</p>
                {downloadStarted && <p className="text-xs">Your PDF download has started.</p>}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild className="w-full sm:w-auto">
                    <a download={filename} href={pdfUrl}>
                      <Download />
                      Download Application PDF
                    </a>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {emailDelivered ? (
            <Alert className="border-border bg-muted">
              <Mail />
              <AlertTitle>Confirmation email sent</AlertTitle>
              <AlertDescription>
                We&apos;ve sent confirmation that we received your application to:
                <p className="mt-1 font-mono font-medium text-foreground">{maskEmail(email)}</p>
                <p className="mt-1">Please keep this email for your records.</p>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-border bg-muted">
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
          <div className="grid gap-3 sm:flex sm:flex-wrap">
            <Button onClick={() => router.push(`/applications/${applicationId}/submitted`)} variant="outline">View Submitted Application</Button>
            <Button onClick={() => { onDashboard(); router.push("/dashboard"); }}>Return to Dashboard</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
