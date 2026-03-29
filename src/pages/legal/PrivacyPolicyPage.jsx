import LegalPageLayout, { LegalSection } from "@/pages/legal/LegalPageLayout";

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      label="Privacy Policy"
      title="Your Data, Handled Responsibly"
      summary="This policy explains what data FastSewa collects, why we collect it, and how we protect it while delivering compliance and filing services."
      lastUpdated="March 29, 2026"
    >
      <LegalSection title="1. Information We Collect">
        <p>
          We may collect personal details such as name, email, phone number, business details, tax identifiers, and
          documents you upload for service completion.
        </p>
        <p>
          We also collect basic technical information like IP address, browser type, and usage activity to improve
          platform reliability and security.
        </p>
      </LegalSection>

      <LegalSection title="2. How We Use Information">
        <p>We use your information to:</p>
        <p>Provide requested services and process filings.</p>
        <p>Authenticate accounts and secure user access.</p>
        <p>Send service updates, transactional emails, and support communication.</p>
        <p>Maintain compliance records, audit logs, and legal documentation where required.</p>
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>
          We do not sell your personal data. Information may be shared only with trusted service providers,
          consultants, payment partners, and government/compliance systems when needed to complete your requested
          service.
        </p>
        <p>
          We may also disclose data when required by law, legal process, or to protect the rights and security of
          FastSewa and its users.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Security">
        <p>
          We use reasonable administrative and technical safeguards to protect your data. While no online system is
          fully risk-free, we continuously work to reduce unauthorized access, misuse, or data exposure.
        </p>
      </LegalSection>

      <LegalSection title="5. Data Retention">
        <p>
          We retain data for as long as needed to deliver services, satisfy legal/compliance obligations, resolve
          disputes, and enforce agreements. Retention duration may vary by service type and governing law.
        </p>
      </LegalSection>

      <LegalSection title="6. Your Rights">
        <p>
          You can request account/profile updates and raise data-related queries through official support channels.
          Where legally applicable, you may request access, correction, or deletion of certain personal data.
        </p>
      </LegalSection>

      <LegalSection title="7. Policy Updates">
        <p>
          We may update this Privacy Policy from time to time. Revised terms become effective when posted on this
          page. Continued use of the platform after updates indicates acceptance of the revised policy.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
