import LegalPageLayout, { LegalSection } from "@/pages/legal/LegalPageLayout";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      label="Terms of Service"
      title="Terms for Using FastSewa"
      summary="These terms govern your use of FastSewa services, website, and account. By using the platform, you agree to follow the conditions below."
      lastUpdated="March 29, 2026"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using FastSewa, you agree to these Terms of Service and applicable laws. If you do not
          agree, you should not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Scope of Services">
        <p>
          FastSewa provides compliance and documentation assistance, including filing workflows and operational support.
          Final approvals, processing timelines, and responses from government or external authorities are outside
          FastSewa's direct control.
        </p>
      </LegalSection>

      <LegalSection title="3. User Responsibilities">
        <p>As a user, you agree to:</p>
        <p>Provide accurate and complete information/documents.</p>
        <p>Maintain confidentiality of your login credentials.</p>
        <p>Use the platform only for lawful purposes.</p>
        <p>Respond promptly to document or clarification requests needed for filings.</p>
      </LegalSection>

      <LegalSection title="4. Payments and Fees">
        <p>
          Service fees are shown before order confirmation. Payments are processed through authorized payment partners.
          Any gateway charges, taxes, or third-party charges are subject to applicable partner or regulatory rules.
        </p>
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <p>
          Platform content, branding, UI elements, and technology are owned by FastSewa or licensed to FastSewa.
          Unauthorized copying, resale, or reverse engineering is prohibited.
        </p>
      </LegalSection>

      <LegalSection title="6. Service Limitations">
        <p>
          FastSewa does not guarantee uninterrupted availability, authority turnaround times, or outcomes dependent on
          external departments or user-provided information quality.
        </p>
      </LegalSection>

      <LegalSection title="7. Suspension or Termination">
        <p>
          We may suspend or terminate access for misuse, policy violations, fraudulent activity, or non-compliance with
          legal requirements.
        </p>
      </LegalSection>

      <LegalSection title="8. Changes to Terms">
        <p>
          We may revise these terms when services, legal requirements, or platform operations change. Updated terms
          will be published on this page and apply from the posted date.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
