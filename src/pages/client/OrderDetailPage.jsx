import { useEffect, useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft, CheckCircle2, Circle, Upload, FileText,
  User, Calendar, CreditCard, MessageSquare
} from "lucide-react"
import { Button, StatusBadge } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { ordersApi, submitHostedPayment } from "@/lib/api"
import { hasAnyPermission, hasPermission } from "@/lib/adminPermissions"
import { buildWhatsAppUrl } from "@/lib/support"
import { notifyError, notifyInfo, notifySuccess, notifyWarning } from "@/lib/toast"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

export default function OrderDetailPage() {
  const { user } = useAuth()
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [savingAdmin, setSavingAdmin] = useState(false)
  const [adminForm, setAdminForm] = useState({
    status: "pending",
    paymentStatus: "pending",
    assignedTo: "",
    notes: "",
  })
  const canViewAdminOrderDetails = hasAnyPermission(user, ["orders.view", "orders.manage", "orders.bulk"])
  const canManageOrder = hasPermission(user, "orders.manage")

  useEffect(() => {
    let active = true

    async function loadOrder() {
      setLoading(true)
      try {
        const data = await ordersApi.get(orderId)
        if (!active) return
        setOrder(data.order)
        setError("")
      } catch (requestError) {
        if (!active) return
        setError(requestError.message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadOrder()

    return () => {
      active = false
    }
  }, [orderId])

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length || !order) return

    setUploading(true)
    try {
      let nextOrder = order

      for (const file of files) {
        const data = await ordersApi.addDocument(order.id, { name: file.name })
        nextOrder = data.order
      }

      setOrder(nextOrder)
      setError("")
      notifySuccess(`${files.length} document${files.length === 1 ? "" : "s"} uploaded to this order.`)
    } catch (requestError) {
      notifyError(requestError, "Unable to upload documents right now.")
    } finally {
      setUploading(false)
    }
  }

  const handlePayment = async () => {
    if (!order) return

    setProcessingPayment(true)
    try {
      const data = await ordersApi.initiateCcavenue(order.id)
      setError("")
      notifyInfo("Redirecting you to CCAvenue for secure payment...")
      submitHostedPayment(data.payment)
    } catch (requestError) {
      notifyError(requestError, "Unable to start payment right now.")
    } finally {
      setProcessingPayment(false)
    }
  }

  useEffect(() => {
    if (!order) return

    setAdminForm({
      status: order.status,
      paymentStatus: order.paymentStatus,
      assignedTo: order.assignedTo || "",
      notes: order.notes || "",
    })
  }, [order])

  const setAdminField = (key) => (event) => {
    setAdminForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleAdminSave = async () => {
    if (!order) return

    setSavingAdmin(true)
    try {
      const data = await ordersApi.adminUpdate(order.id, adminForm)
      setOrder(data.order)
      setError("")
      notifySuccess(data.message || "Order updated successfully.")
    } catch (requestError) {
      notifyError(requestError, "Unable to save admin changes right now.")
    } finally {
      setSavingAdmin(false)
    }
  }

  const handleWhatsAppChat = () => {
    const whatsappUrl = buildWhatsAppUrl({
      orderNumber: order?.orderNumber || order?.id,
      serviceName: order?.serviceName,
      clientName: order?.clientName || user?.name,
    })

    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  const paymentState = searchParams.get("payment")
  const paymentMessage = searchParams.get("message")

  useEffect(() => {
    if (!paymentState) {
      return
    }

    if (paymentState === "success") {
      notifySuccess(paymentMessage || "Payment confirmed through CCAvenue.")
      return
    }

    if (paymentState === "pending") {
      notifyInfo(paymentMessage || "CCAvenue payment is still awaiting confirmation.")
      return
    }

    if (paymentState === "failed") {
      notifyWarning(paymentMessage || "CCAvenue payment was not completed. You can retry from this page.")
    }
  }, [paymentMessage, paymentState])

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 md:pl-64">
        <div className="max-w-4xl mx-auto px-6 text-white/40">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-20 md:pl-64">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-red-400 mb-4">{error || "Order not found."}</p>
          <Button onClick={() => navigate("/dashboard/orders")}>Back to Orders</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 md:pl-64">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => navigate("/dashboard/orders")}
          className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={15} /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">{order.serviceName}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm font-mono text-white/35">{order.orderNumber || order.id}</span>
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
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="glass rounded-xl p-4 text-sm text-red-400">{error}</div>
            )}

            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-bold text-white mb-6 flex items-center gap-2">
                <Calendar size={16} className="text-brand-400" /> Order Progress
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-4 bottom-4 w-px bg-white/8" />
                <div className="flex flex-col gap-5">
                  {order.timeline.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 relative">
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

              {order.documents?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {order.documents.map((document, index) => (
                    <div key={index} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-green-500/8 border border-green-500/20">
                      <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                      <span className="text-sm text-white/60 flex-1 truncate">{document.name}</span>
                      <span className="text-xs text-green-400">Uploaded</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Order Summary</h3>
              <div className="space-y-3">
                <InfoRow icon={FileText} label="Service" value={order.serviceName} />
                <InfoRow icon={CreditCard} label="Amount" value={formatCurrency(order.amount)} accent />
                <InfoRow icon={Calendar} label="Placed On" value={formatDate(order.createdAt)} />
                {canViewAdminOrderDetails && order.clientName && (
                  <InfoRow icon={User} label="Client" value={order.clientName} />
                )}
                {canViewAdminOrderDetails && order.clientEmail && (
                  <InfoRow icon={MessageSquare} label="Email" value={order.clientEmail} />
                )}
                {order.assignedTo && (
                  <InfoRow icon={User} label="Assigned CA" value={order.assignedTo} />
                )}
              </div>
            </div>

            {canManageOrder && (
              <div className="glass rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Admin Controls</h3>
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <label className="text-xs text-white/35 block mb-1.5">Order Status</label>
                      <select
                        value={adminForm.status}
                        onChange={setAdminField("status")}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                      >
                        {["pending", "processing", "completed", "cancelled"].map((status) => (
                          <option key={status} value={status} className="bg-[#121212]">{status}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-white/35 block mb-1.5">Payment Status</label>
                      <select
                        value={adminForm.paymentStatus}
                        onChange={setAdminField("paymentStatus")}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                      >
                        {["pending", "paid", "failed", "refunded"].map((status) => (
                          <option key={status} value={status} className="bg-[#121212]">{status}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-white/35 block mb-1.5">Assigned CA / Team</label>
                    <input
                      value={adminForm.assignedTo}
                      onChange={setAdminField("assignedTo")}
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                      placeholder="FastSewa CA Team"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-white/35 block mb-1.5">Latest Update</label>
                    <textarea
                      rows={4}
                      value={adminForm.notes}
                      onChange={setAdminField("notes")}
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none"
                      placeholder="Add a client-facing update for this order..."
                    />
                  </div>

                  <Button className="w-full" size="sm" loading={savingAdmin} onClick={handleAdminSave}>
                    Save Admin Changes
                  </Button>
                </div>
              </div>
            )}

            {order.paymentStatus !== "paid" && (
              <div className="glass rounded-xl p-5 border border-yellow-500/20">
                <p className="text-sm font-medium text-yellow-400 mb-3">
                  {order.paymentStatus === "failed" ? "Payment Failed" : "Payment Pending"}
                </p>
                <p className="text-xs text-white/40 mb-4">
                  {order.paymentStatus === "failed"
                    ? "Retry the payment on CCAvenue to resume order processing."
                    : "Complete payment on CCAvenue to start processing your order."}
                </p>
                <Button className="w-full" size="sm" loading={processingPayment} onClick={handlePayment}>
                  {order.paymentStatus === "failed" ? "Retry on CCAvenue" : `Pay ${formatCurrency(order.pricing?.totalAmount || order.amount)}`}
                </Button>
              </div>
            )}

            <div className="glass rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Need Help?</h3>
              <Button variant="outline" className="w-full gap-2" size="sm" onClick={handleWhatsAppChat}>
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
