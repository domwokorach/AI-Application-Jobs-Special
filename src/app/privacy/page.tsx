import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { legalConfig } from "@/config/legal";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2"><h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>{children}</section>;
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      description="This privacy information explains how personal information provided through the recruitment portal is handled as part of the recruitment process."
      lastUpdated={legalConfig.privacyLastUpdated ? `Last updated: ${legalConfig.privacyLastUpdated}` : undefined}
      title="Privacy Policy"
    >
      <p className="rounded-lg border border-border bg-muted p-4 text-muted-foreground">This page is a configurable recruitment privacy-policy structure. It must be completed with organisation-approved information before production use.</p>
      <Section title="Who we are"><p>Organisation-approved controller and privacy contact information will be provided here.</p></Section>
      <Section title="Information we collect"><p>Recruitment information may include contact details, address, job preferences, personal profile and role-interest answers, CVs, supporting documents, work experience, skills, languages, education, right-to-work information, references, and application activity.</p></Section>
      <Section title="Why we use your information"><p>Organisation-approved purposes for handling recruitment information will be provided here.</p></Section>
      <Section title="Our lawful basis for processing"><p>The applicable lawful bases must be set out using the organisation&apos;s approved privacy wording.</p></Section>
      <Section title="Recruitment information"><p>Information submitted in an application is handled for the recruitment process in accordance with approved organisational policy.</p></Section>
      <Section title="CVs and supporting documents"><p>Approved information about document handling and access will be provided here.</p></Section>
      <Section title="Reasonable adjustments"><p>If you provide information about adjustments you may need during recruitment, it should only be available to authorised people who need it for the relevant recruitment or accessibility purpose.</p></Section>
      <Section title="Equality & diversity monitoring"><p>Equality and diversity monitoring is separate from ordinary candidate assessment. It must not be made available to Hiring Managers merely because they can review an application.</p></Section>
      <Section title="Who may access your information"><p>Access is role-based and limited to the minimum information needed for the relevant recruitment purpose. Candidate, Recruitment, Hiring Manager, HR, and authorised Administrator access is not the same.</p></Section>
      <Section title="Who we may share information with"><p>Any approved sharing arrangements and recipients will be described here.</p></Section>
      <Section title="How long we keep your information"><p>{legalConfig.privacyLastUpdated ? "The organisation's approved retention information will be maintained here." : "The organisation's approved retention schedule will be provided here."}</p></Section>
      <Section title="International transfers"><p>Any approved information about international transfers will be provided here.</p></Section>
      <Section title="How we protect your information"><p>This portal applies access controls appropriate to recruitment information. The organisation&apos;s approved security wording will be provided here.</p></Section>
      <Section title="Your data protection rights"><p>Depending on the circumstances and applicable law, you may have rights relating to your personal information. These may include rights concerning access, correction, erasure, restriction, objection and data portability.</p></Section>
      <Section title="Cookies and related technologies"><p>Organisation-approved information about cookies and related technologies will be provided here.</p></Section>
      <Section title="Changes to this privacy policy"><p>Approved changes will be published on this page.</p></Section>
      <Section title="How to contact us"><p>{legalConfig.privacyContact ? legalConfig.privacyContact : "The organisation's approved privacy contact mechanism will be provided here."}</p></Section>
    </LegalPageLayout>
  );
}
