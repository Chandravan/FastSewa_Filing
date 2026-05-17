import { StatusBadge } from "@/components/ui"
import { formatDate } from "@/lib/utils"

const CHECKLIST = [
  "CCAvenue dashboard me gateway order id / attempt id match karo.",
  "Payment status Success ho aur amount exact order total ke equal ho.",
  "Currency INR ho, customer/order details match karein.",
  "Doubt ho to paid mark mat karo; verification_pending rakho.",
]

export default function PaymentVerificationPanel({
  disabled = false,
  currentPaymentStatus = "",
  form,
  onFieldChange,
  payment,
}) {
  const auditTrail = Array.isArray(payment?.auditTrail) ? payment.auditTrail : []
  const paymentStatusChanged = currentPaymentStatus && form.paymentStatus !== currentPaymentStatus

  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-200/60 mb-1">Manual Payment Verification</p>
          <h3 className="text-base font-semibold text-white">Admin SOP & audit note</h3>
        </div>
        {paymentStatusChanged && (
          <span className="rounded-full border border-yellow-500/25 bg-yellow-500/10 px-2.5 py-1 text-xs font-medium text-yellow-200">
            Note required
          </span>
        )}
      </div>

      <div className="grid gap-2 mb-4">
        {CHECKLIST.map((item, index) => (
          <div key={item} className="flex gap-2 text-xs text-white/45">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 text-[10px] text-cyan-200">
              {index + 1}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <InputField
          disabled={disabled}
          label="Verification source"
          value={form.paymentVerificationSource}
          onChange={onFieldChange("paymentVerificationSource")}
          placeholder="CCAvenue dashboard"
        />
        <InputField
          disabled={disabled}
          label="CCAvenue tracking id"
          value={form.paymentTrackingId}
          onChange={onFieldChange("paymentTrackingId")}
          placeholder={payment?.trackingId || "Optional"}
        />
        <InputField
          disabled={disabled}
          label="Bank reference no."
          value={form.paymentBankRefNo}
          onChange={onFieldChange("paymentBankRefNo")}
          placeholder={payment?.bankRefNo || "Optional"}
        />
        <div>
          <label className="text-sm font-medium text-white/70 block mb-1.5">
            Internal payment note{paymentStatusChanged ? " *" : ""}
          </label>
          <textarea
            rows={3}
            disabled={disabled}
            value={form.paymentVerificationNote}
            onChange={onFieldChange("paymentVerificationNote")}
            className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none disabled:opacity-60"
            placeholder="Example: Verified in CCAvenue dashboard, amount and INR matched."
          />
        </div>
      </div>

      {auditTrail.length > 0 && (
        <div className="mt-4 border-t border-white/8 pt-4">
          <p className="text-xs uppercase tracking-[0.2em] text-white/30 mb-3">Payment audit trail</p>
          <div className="space-y-3">
            {auditTrail.slice(-4).reverse().map((entry, index) => (
              <div key={`${entry.changedAt || "audit"}-${index}`} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <StatusBadge status={entry.fromStatus || "pending"} />
                  <span className="text-xs text-white/25">to</span>
                  <StatusBadge status={entry.toStatus || "pending"} />
                </div>
                <p className="text-sm text-white/65">{entry.note}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35">
                  <span>{entry.source || "Manual admin verification"}</span>
                  {entry.trackingId && <span>Tracking: {entry.trackingId}</span>}
                  {entry.bankRefNo && <span>Bank Ref: {entry.bankRefNo}</span>}
                  <span>{entry.changedBySnapshot?.name || "Admin"}</span>
                  {entry.changedAt && <span>{formatDate(entry.changedAt)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InputField({ label, value, onChange, placeholder, disabled }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-1.5">{label}</label>
      <input
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500/50 transition-all disabled:opacity-60"
        placeholder={placeholder}
      />
    </div>
  )
}
