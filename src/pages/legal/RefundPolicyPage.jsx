import LegalPageLayout, { LegalSection } from "@/pages/legal/LegalPageLayout";

export default function RefundPolicyPage() {
  return (
    <LegalPageLayout
      label="Refund Policy"
      title="Transparent Refund Rules"
      summary="This policy defines when FastSewa service payments are refundable, partially refundable, or non-refundable."
      lastUpdated="March 29, 2026"
    >
      <LegalSection title="1. General Principles">
        <p>
          Refunds depend on service stage, work completed, and external processing status. Because many services involve
          professional effort and filing actions, not all payments are eligible for full refund.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligible Cases">
        <p>Refunds may be considered when:</p>
        <p>You paid for a service and FastSewa could not initiate processing.</p>
        <p>Duplicate payment was made for the same order.</p>
        <p>Service is canceled by FastSewa before substantial work begins.</p>
      </LegalSection>

      <LegalSection title="3. Partial / Non-Refundable Cases">
        <p>
          Once documents are reviewed, drafting begins, or filing action is initiated, a full refund may not be
          possible.
        </p>
        <p>
          Government fees, statutory charges, payment gateway fees, and third-party charges are generally
          non-refundable unless recovered by the respective authority/partner.
        </p>
      </LegalSection>

      <LegalSection title="4. Cancellation by User">
        <p>
          Users can request cancellation before active processing. If work has already started, refund (if any) will be
          adjusted based on processing stage and resources used.
        </p>
      </LegalSection>

      <LegalSection title="5. Refund Timeline">
        <p>
          Approved refunds are typically processed within 5 to 10 business days to the original payment method. Actual
          credit timing may vary depending on bank or payment provider.
        </p>
      </LegalSection>

      <LegalSection title="6. How to Request a Refund">
        <p>
          Share your order number, payment details, and reason for refund through FastSewa support channels. Our team
          will review and respond with eligibility outcome and next steps.
        </p>
      </LegalSection>

      <LegalSection title="7. Policy Updates">
        <p>
          We may revise this policy to align with operational and legal requirements. Updated terms become effective
          once published on this page.
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
