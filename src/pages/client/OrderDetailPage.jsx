import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft, CheckCircle2, Circle, Upload, FileText,
  User, Calendar, CreditCard, MessageSquare, Download
} from "lucide-react"
import { Button, StatusBadge, Badge, Card } from "@/components/ui"
import { MOCK_ORDERS } from "@/data/mockData"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])

  const order = MOCK_ORDERS.find((o) => o.id === orderId) || MOCK_ORDERS[0]

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    await new Promise((r) => setTimeout(r, 1500)) // Simulate upload
    setUploadedFiles((prev) => [...prev, ...files.map((f) => f.name)])
    setUploading(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 md:pl-64">
      <div className="max-w-4xl mx-auto px-6">

        {/* Back */}
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to Orders
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">{order.serviceName}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-mono text-white/35">{order.id}</span>
              <StatusBadge status={order.status} />
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold font-mono text-brand-400">{formatCurrency(order.amount)}</p>
            <p className="text-sm text-white/35 mt-1">Placed {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Timeline + Documents */}
          <div className="lg:col-span-2 space-y-6">

            {/* Timeline */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={16} className="text-brand-400" /> Order Progress
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-white/8" />
                <div className="flex flex-col gap-5">
                  {order.timeline.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 transition-all",
                        step.done
                          ? "bg-brand-500 border-2 border-brand-500"
                          : "bg-surface-50 border-2 border-white/10"
                      )}>
                        {step.done
                          ? <CheckCircle2 size={14} className="text-white" />
                          : <Circle size={14} className="text-white/20" />
                        }
                      </div>
                      <div className="pt-1 min-w-0">
                        <p className={cn("text-sm font-medium", step.done ? "text-white" : "text-white/35")}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-xs text-white/25 mt-0.5">{formatDate(step.date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {order.notes && (
                <div className="mt-6 pt-5 border-t border-white/8">
                  <p className="text-xs text-white/35 mb-1.5 font-medium uppercase tracking-wider">Latest Update</p>
                  <p className="text-sm text-white/60 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-bold text-white mb-5 flex items-center gap-2">
                <Upload size={16} className="text-brand-400" /> Upload Documents
              </h2>

              <label className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all",
                "border-white/10 hover:border-brand-500/40 hover:bg-brand-500/3",
                uploading && "opacity-60 pointer-events-none"
              )}>
                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.jpeg,.png" />
                {uploading ? (
                  <span className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload size={24} className="text-white/25" />
                )}
                <div className="text-center">
                  <p className="text-sm text-white/60 font-medium">
                    {uploading ? "Uploading..." : "Click to upload or drag & drop"}
                  </p>
                  <p className="text-xs text-white/25 mt-1">PDF, JPG, PNG up to 10MB</p>
                </div>
              </label>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-green-500/8 border border-green-500/20">
                      <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                      <span className="text-sm text-white/60 flex-1 truncate">{name}</span>
                      <span className="text-xs text-green-400">Uploaded</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Order info */}
          <div className="space-y-4">
            {/* Summary */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3">
                <InfoRow icon={FileText} label="Service" value={order.serviceName} />
                <InfoRow icon={CreditCard} label="Amount" value={formatCurrency(order.amount)} accent />
                <InfoRow icon={Calendar} label="Placed On" value={formatDate(order.createdAt)} />
                {order.assignedTo && (
                  <InfoRow icon={User} label="Assigned CA" value={order.assignedTo} />
                )}
              </div>
            </div>

            {/* Payment */}
            {order.paymentStatus === "pending" && (
              <div className="glass rounded-xl p-5 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-400 mb-3">⚠️ Payment Pending</p>
                <p className="text-xs text-white/40 mb-4">Complete payment to start processing your order.</p>
                <Button className="w-full" size="sm">
                  Pay {formatCurrency(order.amount)}
                </Button>
              </div>
            )}

            {/* Support */}
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Need Help?</h3>
              <Button variant="outline" className="w-full gap-2" size="sm">
                <MessageSquare size={14} /> Chat on WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={14} className="text-white/25 shrink-0" />
      <span className="text-xs text-white/35 flex-1">{label}</span>
      <span className={cn("text-sm font-medium text-right", accent ? "text-brand-400 font-mono font-bold" : "text-white/70")}>
        {value}
      </span>
    </div>
  )
}
