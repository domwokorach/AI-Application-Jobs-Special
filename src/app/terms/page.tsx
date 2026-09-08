import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { legalConfig } from "@/config/legal";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2"><h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>{children}</section>;
}

export default function TermsPage() {
  return (
    <LegalPageLayout
      description="These terms explain the conditions that apply when using this recruitment portal and submitting a job application."
      lastUpdated={legalConfig.termsLastUpdated ? `Last updated: ${legalConfig.termsLastUpdated}` : undefined}
      title="Terms & Conditions"
    >
      <Section title="About this recruitment portal"><p>This portal supports recruitment activity for {legalConfig.organisationName}. Its content and services may change as recruitment processes develop.</p></Section>
      <Section title="Using your account"><p>You are responsible for keeping your account and sign-in details secure. Do not knowingly allow another person to use your account to submit information on your behalf unless this has been appropriately authorised.</p></Section>
      <Section title="Providing accurate information"><p>When submitting an application, you should ensure that the information you provide is complete and accurate to the best of your knowledge.</p></Section>
      <Section title="Job applications"><p>Use the application process for the role you are interested in and provide information relevant to that application.</p></Section>
      <Section title="Application submission"><p>Before submitting your application, you will have an opportunity to review the information you have provided. After submission, some information may no longer be editable through the portal.</p></Section>
      <Section title="Recruitment outcomes"><p>Submitting an application does not guarantee that you will progress to the next stage of the recruitment process or receive an offer of employment.</p></Section>
      <Section title="Candidate documents"><p>Only upload documents that you are entitled to provide and that are relevant to your application.</p></Section>
      <Section title="Acceptable use"><p>Do not use the portal in a way that could disrupt its operation, compromise another person&apos;s information, or bypass its security controls.</p></Section>
      <Section title="Account security"><p>Tell us through an available support route if you believe your account has been accessed without your permission.</p></Section>
      <Section title="Availability of the service"><p>We aim to make the portal available, but access may be interrupted for maintenance, updates, or circumstances outside our control.</p></Section>
      <Section title="Changes to these terms"><p>Organisation-approved changes to these terms will be published on this page.</p></Section>
      <Section title="Contact information"><p>Use the contact route made available in the portal if you have a question about these terms.</p></Section>
    </LegalPageLayout>
  );
}
