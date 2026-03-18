import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload,
  CreditCard, FileText, Info, Clock
} from "lucide-react"
import { Button, Input, Badge } from "@/components/ui"
import { SERVICES } from "@/data/mockData"
import { formatCurrency, cn } from "@/lib/utils"

const STEPS = ["Service Details", "Documents", "Payment"]

export default function OrderPlacementPage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const service = SERVICES.find((s) => s.id === serviceId) || SERVICES[0]

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ notes: "", files: [] })
  const [placing, setPlacing] = useState(false)

  const handleNext = () => setStep((s) => Math.min(s + 1, 2))
  const handleBack = () => step === 0 ? navigate("/services") : setStep((s) => s - 1)

  const handleFileAdd = (e) => {
    const files = Array.from(e.target.files).map((f) => f.name)
    setForm((p) => ({ ...p, files: [...p.files, ...files] }))
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 2000)) // Simulate API
    navigate("/dashboard/orders")
  }

  return (
    <div className="min-h-screen pt-24 pb-20 grid-bg">
      <div className="max-w-2xl mx-auto px-6">

        {/* Back */}
        <button onClick={handleBack} className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8">
          <ArrowLeft size={15} /> {step === 0 ? "Back to Services" : "Previous Step"}
        </button>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  i < step ? "bg-brand-500 text-white" :
                  i === step ? "bg-brand-500/20 border-2 border-brand-500 text-brand-400" :
                  "bg-white/5 border border-white/10 text-white/25"
                )}>
                  {i < step ? <CheckCircle2 size={15} /> : i + 1}
                </div>
                <span className={cn("text-sm font-medium hidden sm:block", i === step ? "text-white" : "text-white/30")}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-white/8 mx-2" />}
            </div>
          ))}
        </div>

        {/* Service summary (always visible) */}
        <div className="glass rounded-xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <FileText size={18} className="text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white">{service.name}</p>
            <p className="text-xs text-white/35 flex items-center gap-1.5 mt-0.5">
              <Clock size={11} /> {service.duration}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold font-mono text-brand-400">{formatCurrency(service.price)}</p>
          </div>
        </div>

        {/* Step content */}
        <div className="glass rounded-2xl p-7 animate-fade-in">
          {step === 0 && <StepServiceDetails service={service} form={form} setForm={setForm} />}
          {step === 1 && <StepDocuments service={service} form={form} handleFileAdd={handleFileAdd} setForm={setForm} />}
          {step === 2 && <StepPayment service={service} form={form} placing={placing} onPay={handlePlaceOrder} />}
        </div>

        {/* Navigation */}
        {step < 2 && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleNext} className="gap-2">
              Continue <ArrowRight size={15} />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function StepServiceDetails({ service, form, setForm }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-1">Service Details</h2>
        <p className="text-sm text-white/40">Review what's included and add any notes for our team.</p>
      </div>

      <div className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-2.5">
        <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-3">What's included</p>
        {["Expert CA assigned to your order", "End-to-end filing management", "Document verification", "Filing acknowledgment receipt", "Post-filing support"].map((item) => (
          <div key={item} className="flex items-center gap-2.5">
            <CheckCircle2 size={13} className="text-brand-400 shrink-0" />
            <span className="text-sm text-white/55">{item}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-500/5 border border-blue-500/15 p-4 flex gap-3">
        <Info size={15} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-300 font-medium mb-1">Documents you'll need</p>
          <div className="flex flex-wrap gap-1.5">
            {service.documents.map((doc) => (
              <span key={doc} className="text-xs px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400">{doc}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-white/70 block mb-1.5">Additional Notes (Optional)</label>
        <textarea
          rows={3}
          placeholder="Any specific instructions or details for our CA team..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none"
        />
      </div>
    </div>
  )
}

function StepDocuments({ service, form, handleFileAdd, setForm }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-1">Upload Documents</h2>
        <p className="text-sm text-white/40">Upload the required documents. You can also add them later from your dashboard.</p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/12 p-10 cursor-pointer hover:border-brand-500/40 hover:bg-brand-500/3 transition-all">
        <input type="file" multiple className="hidden" onChange={handleFileAdd} accept=".pdf,.jpg,.jpeg,.png" />
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
          <Upload size={20} className="text-white/30" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white/60">Click to upload documents</p>
          <p className="text-xs text-white/25 mt-1">PDF, JPG, PNG · Max 10MB each</p>
        </div>
      </label>

      {form.files.length > 0 ? (
        <div className="space-y-2">
          {form.files.map((name, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500/8 border border-green-500/20">
              <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              <span className="text-sm text-white/60 flex-1 truncate">{name}</span>
              <button onClick={() => setForm((f) => ({ ...f, files: f.files.filter((_, j) => j !== i) }))}
                className="text-white/20 hover:text-red-400 text-xs transition-colors">Remove</button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-white/25 py-2">No files selected yet. You can skip and upload later.</p>
      )}

      <div className="rounded-xl bg-white/3 border border-white/8 p-4">
        <p className="text-xs text-white/35 font-medium mb-2 uppercase tracking-wider">Required documents</p>
        <div className="flex flex-wrap gap-2">
          {service.documents.map((doc) => (
            <span key={doc} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40">{doc}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepPayment({ service, placing, onPay }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-white mb-1">Confirm & Pay</h2>
        <p className="text-sm text-white/40">Review your order and complete payment via Razorpay.</p>
      </div>

      {/* Bill */}
      <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8">
          <p className="text-xs text-white/35 uppercase tracking-wider font-medium">Order Breakdown</p>
        </div>
        <div className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-white/50">{service.name}</span>
            <span className="text-white font-mono">{formatCurrency(service.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/50">GST (18%)</span>
            <span className="text-white font-mono">{formatCurrency(Math.round(service.price * 0.18))}</span>
          </div>
          <div className="h-px bg-white/8" />
          <div className="flex justify-between">
            <span className="font-bold text-white">Total</span>
            <span className="font-bold text-xl text-brand-400 font-mono">
              {formatCurrency(service.price + Math.round(service.price * 0.18))}
            </span>
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="rounded-xl bg-white/3 border border-white/8 p-5">
        <p className="text-xs text-white/35 uppercase tracking-wider font-medium mb-4">Payment Via</p>
        <div className="grid grid-cols-3 gap-3 text-center text-xs text-white/40">
          {["UPI", "Net Banking", "Cards"].map((m) => (
            <div key={m} className="py-2 rounded-lg bg-white/4 border border-white/8">{m}</div>
          ))}
        </div>
        <p className="text-xs text-white/25 text-center mt-3 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={11} className="text-green-400" /> Secured by Razorpay · 256-bit SSL
        </p>
      </div>

      <Button className="w-full gap-2" size="lg" loading={placing} onClick={onPay}>
        <CreditCard size={16} />
        {placing ? "Processing..." : `Pay ${formatCurrency(service.price + Math.round(service.price * 0.18))}`}
      </Button>

      <p className="text-xs text-white/25 text-center">
        After payment, your order will be confirmed instantly and a CA will be assigned within 24 hours.
      </p>
    </div>
  )
}
