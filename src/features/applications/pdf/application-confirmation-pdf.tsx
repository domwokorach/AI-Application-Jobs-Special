import "server-only";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import type { ApplicationSummary, SubmissionRecord } from "@/features/applications/services/applications.service";

Font.registerHyphenationCallback((word) => [word]);

const ORGANISATION_NAME = "Northstar Careers";

const styles = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 56, paddingHorizontal: 48, fontSize: 10.5, color: "#1c1917", fontFamily: "Helvetica" },
  organisation: { fontSize: 10, color: "#047857", fontFamily: "Helvetica-Bold", marginBottom: 12 },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  subtitle: { fontSize: 11, color: "#047857", marginBottom: 18 },
  infoGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18, borderWidth: 1, borderColor: "#e7e5e4", borderRadius: 4, padding: 14 },
  infoCell: { width: "50%", marginBottom: 10 },
  infoLabel: { fontSize: 8.5, color: "#78716c", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  infoValue: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  paragraph: { marginBottom: 8, lineHeight: 1.5 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 18, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e7e5e4", paddingBottom: 4 },
  row: { flexDirection: "row", marginBottom: 6 },
  rowLabel: { width: "35%", color: "#78716c" },
  rowValue: { width: "65%", fontFamily: "Helvetica-Bold" },
  entryCard: { marginBottom: 8, padding: 10, borderWidth: 1, borderColor: "#e7e5e4", borderRadius: 4 },
  entryTitle: { fontFamily: "Helvetica-Bold", marginBottom: 2 },
  entryMeta: { color: "#57534e" },
  emptyNote: { color: "#78716c", fontStyle: "italic" },
  footer: { position: "absolute", bottom: 24, left: 48, right: 48, flexDirection: "row", justifyContent: "space-between", fontSize: 8.5, color: "#78716c", borderTopWidth: 1, borderTopColor: "#e7e5e4", paddingTop: 8 },
});

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value?.trim() || "Not provided"}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value?.trim() || "Not provided"}</Text>
    </View>
  );
}

export type ApplicationConfirmationPdfProps = {
  submission: SubmissionRecord;
};

export function ApplicationConfirmationPdf({ submission }: ApplicationConfirmationPdfProps) {
  const { reference, submittedAt, jobTitle, location, summary } = submission;
  const submittedLabel = format(new Date(submittedAt), "d MMMM yyyy 'at' HH:mm");
  const generatedLabel = format(new Date(), "d MMMM yyyy");

  return (
    <Document
      title={`Application confirmation ${reference}`}
      author={ORGANISATION_NAME}
      subject="Application confirmation receipt"
    >
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.organisation}>{ORGANISATION_NAME}</Text>
        <Text style={styles.h1}>Application Confirmation</Text>
        <Text style={styles.subtitle}>Application successfully submitted</Text>

        <View style={styles.infoGrid}>
          <Field label="Application Reference" value={reference} />
          <Field label="Status" value="Submitted" />
          <Field label="Job" value={jobTitle} />
          <Field label="Location" value={location} />
          <Field label="Applicant" value={summary.personalDetails.fullName} />
          <Field label="Submitted" value={submittedLabel} />
        </View>

        <Text style={styles.paragraph}>Thank you for your application.</Text>
        <Text style={styles.paragraph}>We have successfully received your application.</Text>
        <Text style={styles.paragraph}>Please keep your application reference for your records.</Text>
        <Text style={styles.paragraph}>
          Our recruitment team will contact you if there is an update to your application.
        </Text>

        <Text style={styles.sectionTitle}>Personal Details</Text>
        <DetailRow label="Full name" value={summary.personalDetails.fullName} />
        <DetailRow label="Email" value={summary.personalDetails.email} />
        <DetailRow label="Mobile" value={summary.personalDetails.mobile} />
        <DetailRow label="Address" value={summary.personalDetails.address} />
        <DetailRow label="Postcode" value={summary.personalDetails.postcode} />

        <Text style={styles.sectionTitle}>Job Preferences</Text>
        <DetailRow label="Role" value={summary.jobPreferences.role} />
        <DetailRow label="Location" value={summary.jobPreferences.location} />
        <DetailRow label="Employment type" value={summary.jobPreferences.employmentType} />
        <DetailRow label="Available from" value={summary.jobPreferences.availableFrom} />

        <Text style={styles.sectionTitle}>Work Experience</Text>
        {summary.workExperience.length === 0 ? (
          <Text style={styles.emptyNote}>No work experience provided.</Text>
        ) : (
          summary.workExperience.map((entry, index) => (
            <View key={index} style={styles.entryCard} wrap={false}>
              <Text style={styles.entryTitle}>{entry.title || "Not provided"}</Text>
              <Text style={styles.entryMeta}>{entry.employer || "Not provided"}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Education</Text>
        {summary.education.length === 0 ? (
          <Text style={styles.emptyNote}>No education history provided.</Text>
        ) : (
          summary.education.map((entry, index) => (
            <View key={index} style={styles.entryCard} wrap={false}>
              <Text style={styles.entryTitle}>{entry.qualification || "Not provided"}</Text>
              <Text style={styles.entryMeta}>{entry.institution || "Not provided"}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>References</Text>
        {summary.references.length === 0 ? (
          <Text style={styles.emptyNote}>No references provided.</Text>
        ) : (
          summary.references.map((entry, index) => (
            <View key={index} style={styles.entryCard} wrap={false}>
              <Text style={styles.entryTitle}>{entry.name || "Not provided"}</Text>
              <Text style={styles.entryMeta}>{entry.email || "Not provided"}</Text>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Declaration</Text>
        <DetailRow label="Information confirmed accurate" value={summary.declaration.accurate ? "Yes" : "No"} />
        <DetailRow label="Edit restriction acknowledged" value={summary.declaration.editRestrictionAcknowledged ? "Yes" : "No"} />

        <View style={styles.footer} fixed>
          <Text>Application Reference: {reference}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
          <Text>Generated: {generatedLabel}</Text>
        </View>
      </Page>
    </Document>
  );
}

export type { ApplicationSummary };
