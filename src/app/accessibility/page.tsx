import { LegalPageLayout } from "@/components/layout/legal-page-layout";
import { legalConfig } from "@/config/legal";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-2"><h2 className="font-serif text-2xl font-semibold tracking-tight">{title}</h2>{children}</section>;
}

export default function AccessibilityPage() {
  return (
    <LegalPageLayout
      description="We want this recruitment portal to be accessible and usable by as many people as possible."
      lastUpdated={legalConfig.accessibilityLastReviewed ? `Last reviewed: ${legalConfig.accessibilityLastReviewed}` : undefined}
      title="Accessibility Statement"
    >
      <Section title="Our accessibility commitment"><p>This portal has been designed with WCAG 2.2 Level AA as its accessibility target. The production statement must reflect the results of actual accessibility testing.</p></Section>
      <Section title="Using this website"><p>You should be able to use this portal across responsive screen sizes, with browser zoom and text resizing.</p></Section>
      <Section title="Keyboard navigation"><p>You should be able to navigate interactive content using a keyboard, including visible focus indicators.</p></Section>
      <Section title="Screen readers"><p>The portal uses semantic HTML, labels, descriptions, and validation messages to support screen-reader software.</p></Section>
      <Section title="Zoom and text resizing"><p>Do not disable browser zoom or text resizing when using this portal.</p></Section>
      <Section title="Colour and contrast"><p>Colour is not intended to be the only way important information is communicated.</p></Section>
      <Section title="Forms and error messages"><p>Application sections provide labels and validation feedback to help you understand and correct information.</p></Section>
      <Section title="Uploading documents"><p>Use the document-upload guidance provided within your application. Contact Recruitment if you need an appropriate alternative.</p></Section>
      <Section title="Reasonable adjustments"><p>If you need an adjustment to use this recruitment portal or take part in the recruitment process, you can tell us through the Reasonable Adjustments section of your application.</p></Section>
      <Section title="Known accessibility issues"><p>Organisation-approved known issues and planned improvements will be published here.</p></Section>
      <Section title="Reporting an accessibility problem"><p>{legalConfig.accessibilityContact ? legalConfig.accessibilityContact : "If you experience an accessibility problem while using this recruitment portal, please let us know using an available Recruitment contact route."}</p></Section>
      <Section title="Alternative ways to apply"><p>If you cannot use the online application process because of an accessibility requirement, contact Recruitment to discuss an appropriate alternative.</p></Section>
      <Section title="Technical information"><p>Security and privacy features must coexist with accessibility. They must not disable keyboard navigation, screen readers, browser zoom, text resizing, focus indicators, or assistive technology.</p></Section>
      <Section title="Statement preparation and review"><p>{legalConfig.accessibilityLastReviewed ? `This statement was last reviewed on ${legalConfig.accessibilityLastReviewed}.` : "This statement will be reviewed and updated using the organisation's accessibility testing and governance process."}</p></Section>
    </LegalPageLayout>
  );
}
