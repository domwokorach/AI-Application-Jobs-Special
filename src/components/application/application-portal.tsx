"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { AlertCircle, ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarIcon, CheckCircle2, ChevronDown, CircleUserRound, FileText, GraduationCap, Info, MapPin, Paperclip, Plus, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { ApplicationShell } from "./application-shell";
import { applicationSteps } from "@/constants/application-steps";
import { applicationSchema, type ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

type Values = ApplicationFormValues;

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

function RepeatableCards({ control, kind }: { control: ReturnType<typeof useForm<Values>>["control"]; kind: "work" | "education" | "references" }) {
  const { fields, append, remove } = useFieldArray({ control, name: kind });
  const config = kind === "work" ? { title: "Work experience", fields: ["Job title", "Employer"], icon: BriefcaseBusiness, empty: { title: "", employer: "" } } : kind === "education" ? { title: "Education and qualifications", fields: ["Institution", "Qualification"], icon: GraduationCap, empty: { institution: "", qualification: "" } } : { title: "References", fields: ["Reference name", "Email address"], icon: CircleUserRound, empty: { name: "", email: "" } };
  const Icon = config.icon;
  return <div className="space-y-4">{fields.map((item, index) => <Card key={item.id}><CardHeader className="flex-row items-center justify-between space-y-0 pb-4"><CardTitle className="flex items-center gap-2 text-base"><Icon className="size-4 text-emerald-700" />{config.title} {index + 1}</CardTitle>{fields.length > 1 && <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost"><Trash2 />Remove</Button>}</CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{config.fields.map((field) => <Field key={field} label={field}><Input placeholder={`Enter ${field.toLowerCase()}`} /></Field>)}</CardContent></Card>)}<Button onClick={() => append(config.empty)} type="button" variant="outline"><Plus />Add another</Button></div>;
}

function Dashboard({ onContinue }: { onContinue: () => void }) {
  return <div className="min-h-screen bg-stone-50"><header className="border-b bg-white"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5"><div className="flex items-center gap-2 font-serif text-2xl font-semibold"><span className="grid size-8 place-items-center rounded-full bg-emerald-950 font-sans text-sm text-lime-200">N</span>northstar</div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost"><CircleUserRound />Alex Morgan<ChevronDown /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem>Profile settings</DropdownMenuItem><DropdownMenuItem>Sign out</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></header>
    <main className="mx-auto max-w-7xl px-5 py-10 sm:py-14"><p className="text-sm font-medium text-emerald-700">Good afternoon, Alex</p><h1 className="mt-2 font-serif text-4xl tracking-tight sm:text-5xl">Your applications</h1><div className="mt-9 grid gap-6 lg:grid-cols-[1.6fr_1fr]"><Card><CardHeader><div className="flex items-start justify-between gap-3"><div><Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">In progress</Badge><CardTitle className="mt-3 font-serif text-2xl">Customer Experience Associate</CardTitle><CardDescription className="mt-2 flex items-center gap-1"><MapPin className="size-3.5" />London · Hybrid · Full time</CardDescription></div><BriefcaseBusiness className="size-6 text-emerald-700" /></div></CardHeader><CardContent><Separator /><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs text-muted-foreground">Application progress</p><div className="mt-2 flex items-center gap-3"><Progress className="w-48" value={36} /><span className="text-sm font-semibold">5 of 14 sections</span></div></div><p className="text-xs text-muted-foreground">Last saved today, 14:32</p></div><div className="mt-6 flex flex-wrap gap-3"><Button onClick={onContinue}>Continue application <ArrowRight /></Button><Button onClick={onContinue} variant="outline">View application</Button></div></CardContent></Card>
      <Card><CardHeader><CardTitle>Profile summary</CardTitle><CardDescription>Keep your details up to date to make applying faster.</CardDescription></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-full bg-emerald-100 font-semibold text-emerald-800">AM</span><div><p className="text-sm font-semibold">Alex Morgan</p><p className="text-xs text-muted-foreground">alex.morgan@example.com</p></div></div><Separator /><p className="text-sm text-muted-foreground">Your profile is 80% complete.</p><Button className="w-full" variant="outline">Manage profile</Button></CardContent></Card></div>
      <section className="mt-10"><h2 className="font-serif text-2xl">Recent activity</h2><Card className="mt-4"><CardContent className="flex items-center gap-3 p-5"><CheckCircle2 className="size-5 text-emerald-700" /><div><p className="text-sm font-medium">Personal details saved</p><p className="text-xs text-muted-foreground">Today at 14:32</p></div></CardContent></Card></section></main></div>;
}

export function ApplicationPortal({ initialScreen = "dashboard", initialStep = 1 }: { initialScreen?: "dashboard" | "form"; initialStep?: number }) {
  const [screen, setScreen] = useState<"dashboard" | "form">(initialScreen);
  const [current, setCurrent] = useState(initialStep);
  const [submitted, setSubmitted] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const form = useForm<Values>({ resolver: zodResolver(applicationSchema), defaultValues: { fullName: "", email: "", mobile: "", address: "", postcode: "", adjustments: undefined, adjustmentDetails: "", declaration: false, work: [{ title: "", employer: "" }], education: [{ institution: "", qualification: "" }], references: [{ name: "", email: "" }] } });
  const step = applicationSteps[current];
  const errors = form.formState.errors;
  async function next() {
    if (current === 1) {
      const valid = await form.trigger(["fullName", "email", "mobile", "address", "postcode"]);
      if (!valid) {
        toast.error("Please correct the highlighted fields.");
        return;
      }
    }
    if (current === applicationSteps.length - 1) {
      form.handleSubmit(() => setConfirmDialog(true), () => toast.error("Please complete the required declaration."))();
      return;
    }
    setCurrent((value) => value + 1);
    toast.success("Changes saved");
  }
  if (screen === "dashboard") return <Dashboard onContinue={() => setScreen("form")} />;
  if (submitted) return <Confirmation onDashboard={() => setScreen("dashboard")} />;
  return <ApplicationShell current={current} onSelect={setCurrent} steps={applicationSteps}><main className="mx-auto max-w-3xl px-5 pb-28 pt-10 sm:px-8 sm:pt-16"><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Step {current + 1} of {applicationSteps.length}</p>
    <FormSection title={step.label} optional={step.optional} description={descriptionFor(step.id)}>
      <StepContents current={current} control={form.control} errors={errors} form={form} onEdit={setCurrent} />
      <nav className="fixed inset-x-0 bottom-0 z-10 flex min-h-18 items-center justify-between border-t bg-white/95 px-5 py-3 backdrop-blur md:static md:mt-10 md:border-b md:bg-transparent md:px-0"><Button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} variant="ghost"><ArrowLeft />Previous</Button><Button onClick={next}>{current === applicationSteps.length - 1 ? "Submit application" : "Save and continue"}{current < applicationSteps.length - 1 && <ArrowRight />}</Button></nav>
    </FormSection></main><Dialog onOpenChange={setConfirmDialog} open={confirmDialog}><DialogContent><DialogHeader><DialogTitle>Submit your application?</DialogTitle><DialogDescription>Once submitted, your application will be sent to the recruitment team for review.</DialogDescription></DialogHeader><DialogFooter><Button onClick={() => setConfirmDialog(false)} variant="outline">Continue editing</Button><Button onClick={() => { setConfirmDialog(false); setSubmitted(true); }}>Submit application</Button></DialogFooter></DialogContent></Dialog></ApplicationShell>;
}

function descriptionFor(id: string) { return ({ account: "Create an account to securely save your application and return whenever you need.", "personal-details": "Please provide the details we need to contact you about your application.", "job-preferences": "Tell us which role and working arrangements are the best fit for you.", "about-you": "Share a short introduction and why this opportunity interests you.", cv: "Upload your CV in PDF, DOC or DOCX format. You can still complete this application without one.", experience: "Add your employment history. If you have no previous experience, leave this section blank.", skills: "Add skills, languages, licences and professional qualifications relevant to this role.", education: "Tell us about your education and qualifications.", "right-to-work": "We need to confirm your eligibility to work in the UK.", adjustments: "Tell us how we can make the recruitment process accessible and supportive for you.", "equality-diversity": "Help us understand whether our recruitment is fair and inclusive.", references: "Add people who can comment on your work or character.", declaration: "Please read and confirm the following statement.", review: "Review your application before submitting it." } as Record<string, string>)[id]; }

function StepContents({ current, control, errors, form, onEdit }: { current: number; control: ReturnType<typeof useForm<Values>>["control"]; errors: ReturnType<typeof useForm<Values>>["formState"]["errors"]; form: ReturnType<typeof useForm<Values>>; onEdit: (index: number) => void }) {
  if (current === 4) return <FileUpload />;
  if ([5, 7, 11].includes(current)) return <RepeatableCards control={control} kind={current === 5 ? "work" : current === 7 ? "education" : "references"} />;
  if (current === 9) return <Adjustments form={form} />;
  if (current === 10) return <Equality />;
  if (current === 13) return <Review onEdit={onEdit} />;
  if (current === 12) return <div className="space-y-5"><Alert><ShieldCheck /><AlertTitle>Your declaration</AlertTitle><AlertDescription>I confirm that the information I have provided is accurate and complete. I understand how Northstar will process my personal information.</AlertDescription></Alert><div className="flex gap-3"><Checkbox id="declaration" onCheckedChange={(checked) => form.setValue("declaration", checked === true, { shouldValidate: true })} /><Label className="leading-5" htmlFor="declaration">I agree to the declaration and have read the Privacy Notice.</Label></div>{errors.declaration && <p className="text-sm text-destructive" role="alert">{errors.declaration.message}</p>}</div>;
  if (current === 8) return <div className="grid gap-6"><Field label="Do you currently have the right to work in the UK?" required><RadioGroup defaultValue="yes"><div className="flex items-center gap-2"><RadioGroupItem id="right-yes" value="yes" /><Label htmlFor="right-yes">Yes, without restrictions</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-visa" value="visa" /><Label htmlFor="right-visa">Yes, with a current visa</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="right-no" value="no" /><Label htmlFor="right-no">No</Label></div></RadioGroup></Field><Field label="Will you require visa sponsorship?" required><Select><SelectTrigger><SelectValue placeholder="Choose an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></Field></div>;
  if (current === 1) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Full name" error={errors.fullName?.message} required><Input aria-describedby={errors.fullName ? "full-name-error" : undefined} {...form.register("fullName")} placeholder="Enter your full name" /></Field><Field label="Email address" error={errors.email?.message} required><Input {...form.register("email")} placeholder="you@example.com" type="email" /></Field><Field label="Mobile number" error={errors.mobile?.message} required><Input {...form.register("mobile")} placeholder="07123 456789" type="tel" /></Field><DatePickerField label="Date of birth" /><Field label="Home address" error={errors.address?.message} required><Input {...form.register("address")} placeholder="Start typing your address" /></Field><Field label="Postcode" error={errors.postcode?.message} required><Input {...form.register("postcode")} placeholder="e.g. SW1A 1AA" /></Field></div>;
  if (current === 0) return <div className="grid gap-5"><Field label="Email address" required><Input placeholder="you@example.com" type="email" /></Field><Field label="Create password" hint="Use at least 12 characters." required><Input type="password" /></Field><Field label="Confirm password" required><Input type="password" /></Field></div>;
  if (current === 2) return <div className="grid gap-5 sm:grid-cols-2"><Field label="Job or role you are applying for" required><Select><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger><SelectContent><SelectItem value="customer-experience">Customer Experience Associate</SelectItem><SelectItem value="team-lead">Customer Experience Team Lead</SelectItem></SelectContent></Select></Field><Field label="Preferred location"><Select><SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger><SelectContent><SelectItem value="london">London</SelectItem><SelectItem value="remote">Remote</SelectItem></SelectContent></Select></Field><Field label="Employment type"><Select><SelectTrigger><SelectValue placeholder="Select employment type" /></SelectTrigger><SelectContent><SelectItem value="full-time">Full-time</SelectItem><SelectItem value="part-time">Part-time</SelectItem><SelectItem value="temporary">Temporary</SelectItem></SelectContent></Select></Field><DatePickerField label="Available start date" /></div>;
  if (current === 3) return <div className="space-y-5"><Field label="Personal profile" hint="Up to 500 words"><Textarea placeholder="Tell us a little about yourself and your experience." rows={6} /></Field><Field label="Why are you interested in this role?"><Textarea placeholder="Share why this opportunity appeals to you." rows={5} /></Field></div>;
  return <div className="grid gap-5 sm:grid-cols-2"><Field label="Key skills"><Input placeholder="e.g. Customer service, Excel, teamwork" /></Field><Field label="Languages"><Input placeholder="Include your level of fluency" /></Field><Field label="Driving licence"><Select><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem><SelectItem value="na">Not applicable</SelectItem></SelectContent></Select></Field><Field label="Professional qualifications"><Input placeholder="Add relevant certificates" /></Field></div>;
}

function Adjustments({ form }: { form: ReturnType<typeof useForm<Values>> }) {
  const choice = form.watch("adjustments");
  const options = ["Visual impairment support", "Deaf or hard-of-hearing support", "Mobility or physical accessibility", "Learning disability support", "Neurodivergence-related adjustment", "Communication support", "Accessible interview location", "Extra assessment time", "Other"];
  return <div className="space-y-6"><Alert className="border-emerald-200 bg-emerald-50"><Info /><AlertTitle>Confidential information</AlertTitle><AlertDescription>This information will be handled confidentially and, where practicable, separately from the information used to assess your application.</AlertDescription></Alert><Field label="Do you require any reasonable adjustments or additional support during the recruitment process?"><RadioGroup onValueChange={(value) => form.setValue("adjustments", value as Values["adjustments"])} value={choice}><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-yes" value="yes" /><Label htmlFor="adjustments-yes">Yes</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-no" value="no" /><Label htmlFor="adjustments-no">No</Label></div><div className="flex items-center gap-2"><RadioGroupItem id="adjustments-discuss" value="discuss" /><Label htmlFor="adjustments-discuss">Prefer to discuss</Label></div></RadioGroup></Field>{choice === "yes" && <div className="space-y-5 rounded-lg border bg-white p-5"><p className="text-sm font-medium">Select any support that would be helpful.</p><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <label className="flex min-h-7 items-center gap-2 text-sm" key={option}><Checkbox />{option}</label>)}</div><Field label="Please tell us what adjustment or support would help you"><Textarea {...form.register("adjustmentDetails")} placeholder="For example, extra time for an assessment or an accessible interview location." rows={5} /></Field></div>}</div>;
}

function Equality() { return <div className="space-y-6"><Alert className="border-indigo-200 bg-indigo-50"><Info /><AlertTitle>Optional equality and diversity monitoring</AlertTitle><AlertDescription>Providing this information is optional. It is used for equality and diversity monitoring and is not used to assess your application.</AlertDescription></Alert><div className="grid gap-5 sm:grid-cols-2">{["Age group", "Sex", "Gender identity", "Race or ethnic group", "Religion or belief", "Sexual orientation"].map((label) => <Field key={label} label={label}><Select><SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger><SelectContent><SelectItem value="prefer-not">Prefer not to say</SelectItem><SelectItem value="option-1">Option 1</SelectItem><SelectItem value="option-2">Option 2</SelectItem></SelectContent></Select></Field>)}</div></div>; }

function Review({ onEdit }: { onEdit: (index: number) => void }) { const sections = [{ label: "Personal details", step: 1 }, { label: "Job preferences", step: 2 }, { label: "Work experience", step: 5 }, { label: "Skills", step: 6 }, { label: "Education", step: 7 }, { label: "Right to work", step: 8 }, { label: "Reasonable adjustments", step: 9 }, { label: "References", step: 11 }]; return <div className="space-y-4"><Alert><Info /><AlertTitle>Almost ready to submit</AlertTitle><AlertDescription>Complete your declaration before submitting. Optional equality monitoring is not included in this review.</AlertDescription></Alert>{sections.map((section) => <Card key={section.label}><CardContent className="flex items-center justify-between p-5"><div><p className="font-medium">{section.label}</p><p className="mt-1 text-sm text-muted-foreground">Information saved</p></div><Button onClick={() => onEdit(section.step)} variant="outline">Edit</Button></CardContent></Card>)}</div>; }

function Confirmation({ onDashboard }: { onDashboard: () => void }) { return <main className="grid min-h-screen place-items-center bg-stone-50 p-5"><Card className="w-full max-w-xl"><CardHeader className="items-center text-center"><span className="grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-800"><CheckCircle2 className="size-7" /></span><CardTitle className="mt-4 font-serif text-3xl">Application submitted</CardTitle><CardDescription>Thank you for applying to Northstar.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-4 rounded-lg bg-stone-50 p-5 text-sm sm:grid-cols-2"><div><p className="text-muted-foreground">Application reference</p><p className="mt-1 font-mono font-semibold">NS-2026-48291</p></div><div><p className="text-muted-foreground">Submitted</p><p className="mt-1 font-semibold">7 September 2026</p></div><div className="sm:col-span-2"><p className="text-muted-foreground">Role</p><p className="mt-1 font-semibold">Customer Experience Associate</p></div></div><Alert><Info /><AlertTitle>What happens next</AlertTitle><AlertDescription>Our recruitment team will review your application. If your experience is a match, we will contact you about the next stage.</AlertDescription></Alert><Button className="w-full" onClick={onDashboard}>Return to dashboard</Button></CardContent></Card></main>; }
