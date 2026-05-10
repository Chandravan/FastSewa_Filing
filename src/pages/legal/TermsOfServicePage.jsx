import { BRAND_NAME, LEGAL_ENTITY_NAME } from "@/lib/support";
import LegalPageLayout, { LegalSection } from "@/pages/legal/LegalPageLayout";

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      label="Terms & Conditions"
      title={`Terms & Conditions for ${BRAND_NAME}`}
      summary={`${BRAND_NAME}, operated by ${LEGAL_ENTITY_NAME}, provides these Terms & Conditions for your use of our services, website, and account.`}
      lastUpdated="March 29, 2026"
    >
      <LegalSection title="1. Acceptance of Terms">
        <p>
          By accessing or using {BRAND_NAME}, you agree to these Terms & Conditions and applicable laws. If you do
          not agree, you should not use the platform.
        </p>
      </LegalSection>

      <LegalSection title="2. Scope of Services">
        <p>
          {BRAND_NAME}, operated by {LEGAL_ENTITY_NAME}, provides compliance and documentation assistance, including filing workflows and operational
          support. Final approvals, processing timelines, and responses from government or external authorities are
          outside our direct control.
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
          Platform content, branding, UI elements, and technology are owned by or licensed to {LEGAL_ENTITY_NAME}.
          Unauthorized copying, resale, or reverse engineering is prohibited.
        </p>
      </LegalSection>

      <LegalSection title="6. Service Limitations">
        <p>
          {BRAND_NAME} does not guarantee uninterrupted availability, authority turnaround times, or outcomes
          dependent on external departments or user-provided information quality.
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
