import { useEffect, useMemo, useState } from "react"
import { ArrowRight, CheckSquare, ClipboardList, CreditCard, Search, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button, Input, StatusBadge } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { hasPermission } from "@/lib/adminPermissions"
import { ordersApi } from "@/lib/api"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/toast"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

const STATUS_FILTERS = ["All", "pending", "processing", "completed", "cancelled"]
const PAYMENT_FILTERS = ["All", "pending", "paid", "failed", "refunded"]
const EMPTY_FORM = {
  status: "pending",
  paymentStatus: "pending",
  assignedTo: "",
  notes: "",
}
const EMPTY_BULK_FORM = {
  status: "",
  paymentStatus: "",
  assignedTo: "",
}

export default function AdminOrdersPage() {
  const { user } = useAuth()
  const canManageOrders = hasPermission(user, "orders.manage")
  const canBulkOrders = hasPermission(user, "orders.bulk")

  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [paymentFilter, setPaymentFilter] = useState("All")
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [selectedIds, setSelectedIds] = useState([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [bulkForm, setBulkForm] = useState(EMPTY_BULK_FORM)

  useEffect(() => {
    let active = true

    async function loadOrders() {
      setLoading(true)
      try {
        const data = await ordersApi.list()
        if (!active) return
        setOrders(data.items)
        setSelectedOrderId((current) => current || data.items[0]?.id || "")
        setSelectedIds((current) => current.filter((id) => data.items.some((order) => order.id === id)))
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

    loadOrders()

    return () => {
      active = false
    }
  }, [])

  const filteredOrders = useMemo(() => (
    orders.filter((order) => {
      const matchStatus = statusFilter === "All" || order.status === statusFilter
      const matchPayment = paymentFilter === "All" || order.paymentStatus === paymentFilter
      const query = search.toLowerCase()
      const matchSearch = !query || [
        order.orderNumber,
        order.serviceName,
        order.clientName,
        order.clientEmail,
      ].filter(Boolean).some((value) => value.toLowerCase().includes(query))

      return matchStatus && matchPayment && matchSearch
    })
  ), [orders, paymentFilter, search, statusFilter])

  const selectedOrder = filteredOrders.find((order) => order.id === selectedOrderId)
    || orders.find((order) => order.id === selectedOrderId)
    || null

  useEffect(() => {
    if (!selectedOrder) {
      setForm(EMPTY_FORM)
      return
    }

    setForm({
      status: selectedOrder.status,
      paymentStatus: selectedOrder.paymentStatus,
      assignedTo: selectedOrder.assignedTo || "",
      notes: selectedOrder.notes || "",
    })
  }, [selectedOrder])

  const stats = useMemo(() => ({
    total: orders.length,
    processing: orders.filter((order) => order.status === "processing").length,
    pending: orders.filter((order) => order.status === "pending").length,
    paymentIssues: orders.filter((order) => order.paymentStatus === "failed").length,
  }), [orders])

  const visibleSelectedCount = filteredOrders.filter((order) => selectedIds.includes(order.id)).length

  const setField = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const setBulkField = (key) => (event) => {
    const value = event.target.value
    setBulkForm((current) => ({ ...current, [key]: value }))
  }

  function toggleSelected(orderId) {
    setSelectedIds((current) => (
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    ))
  }

  function toggleSelectAllVisible() {
    const visibleIds = filteredOrders.map((order) => order.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  function mergeOrders(nextItems) {
    setOrders((current) => current.map((order) => {
      const nextOrder = nextItems.find((item) => item.id === order.id)
      return nextOrder || order
    }))
  }

  async function handleSave() {
    if (!selectedOrder || !canManageOrders) return

    setSaving(true)
    try {
      const data = await ordersApi.adminUpdate(selectedOrder.id, form)
      mergeOrders([data.order])
      setError("")
      notifySuccess(data.message || "Order updated successfully.")
    } catch (requestError) {
      notifyError(requestError, "Unable to save order changes right now.")
    } finally {
      setSaving(false)
    }
  }

  async function handleBulkUpdate() {
    if (!canBulkOrders || selectedIds.length === 0) {
      return
    }

    const payload = { ids: selectedIds }
    if (bulkForm.status) payload.status = bulkForm.status
    if (bulkForm.paymentStatus) payload.paymentStatus = bulkForm.paymentStatus
    if (bulkForm.assignedTo.trim()) payload.assignedTo = bulkForm.assignedTo.trim()

    if (Object.keys(payload).length === 1) {
      notifyWarning("Choose at least one bulk update field before applying the action.")
      return
    }

    setBulkSaving(true)
    try {
      const data = await ordersApi.bulkAdminUpdate(payload)
      mergeOrders(data.items || [])
      setSelectedIds([])
      setBulkForm(EMPTY_BULK_FORM)
      setError("")
      notifySuccess(data.message || "Bulk order update completed successfully.")
    } catch (requestError) {
      notifyError(requestError, "Unable to complete the bulk order update right now.")
    } finally {
      setBulkSaving(false)
    }
  }

  return (
    <AdminShell
      badge="Operations Desk"
      title="Order Desk"
      description="Search, update, and bulk-operate on orders without leaving the admin workspace."
      actions={(
        <>
          <Button variant="outline" onClick={() => navigate("/admin")}>Back to Overview</Button>
          {selectedOrder && (
            <Button onClick={() => navigate(`/dashboard/orders/${selectedOrder.id}`)} className="gap-2">
              Open Full Detail <ArrowRight size={14} />
            </Button>
          )}
        </>
      )}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!canManageOrders && (
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm text-blue-200">
          You have read-only order access right now. Order edits appear only when `orders.manage` is granted.
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <DeskStat label="Total Orders" value={stats.total} tone="bg-blue-500/10 text-blue-300" icon={ClipboardList} />
        <DeskStat label="In Progress" value={stats.processing} tone="bg-orange-500/10 text-orange-300" icon={Sparkles} />
        <DeskStat label="Pending" value={stats.pending} tone="bg-yellow-500/10 text-yellow-300" icon={Search} />
        <DeskStat label="Payment Issues" value={stats.paymentIssues} tone="bg-red-500/10 text-red-300" icon={CreditCard} />
      </div>

      <div className="grid xl:grid-cols-[1.2fr,0.8fr] gap-6">
        <section className="glass rounded-[26px] p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by order, client, or service..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                    statusFilter === status ? "bg-brand-500 text-white" : "glass text-white/45 hover:text-white"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-5">
            {PAYMENT_FILTERS.map((status) => (
              <button
                key={status}
                onClick={() => setPaymentFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-medium uppercase tracking-[0.18em] transition-all",
                  paymentFilter === status ? "bg-white text-background" : "border border-white/10 text-white/45 hover:text-white"
                )}
              >
                {status}
              </button>
            ))}
          </div>

          {canBulkOrders && (
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 mb-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <button
                    type="button"
                    onClick={toggleSelectAllVisible}
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <CheckSquare size={15} />
                    {visibleSelectedCount === filteredOrders.length && filteredOrders.length > 0 ? "Clear visible" : "Select visible"}
                  </button>
                  <span>{selectedIds.length} selected</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <select
                    value={bulkForm.status}
                    onChange={setBulkField("status")}
                    className="rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                  >
                    <option value="" className="bg-[#121212]">Leave order status unchanged</option>
                    {STATUS_FILTERS.filter((item) => item !== "All").map((status) => (
                      <option key={status} value={status} className="bg-[#121212]">{status}</option>
                    ))}
                  </select>

                  <select
                    value={bulkForm.paymentStatus}
                    onChange={setBulkField("paymentStatus")}
                    className="rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
                  >
                    <option value="" className="bg-[#121212]">Leave payment status unchanged</option>
                    {PAYMENT_FILTERS.filter((item) => item !== "All").map((status) => (
                      <option key={status} value={status} className="bg-[#121212]">{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input label="Bulk assignee" value={bulkForm.assignedTo} onChange={setBulkField("assignedTo")} placeholder="FastSewa CA Team" />
                  <div className="sm:self-end">
                    <Button size="sm" variant="outline" loading={bulkSaving} disabled={selectedIds.length === 0} onClick={handleBulkUpdate}>
                      Apply Bulk Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-white/40 py-10">Loading order operations...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-sm text-white/40 py-10">No orders match the current filters.</div>
            ) : (
              filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className={cn(
                    "rounded-2xl border px-4 py-4 transition-all",
                    selectedOrder?.id === order.id
                      ? "border-brand-500/25 bg-brand-500/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {canBulkOrders && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => toggleSelected(order.id)}
                          className="mt-1 rounded border-white/15 bg-white/5"
                        />
                      )}

                      <button
                        onClick={() => setSelectedOrderId(order.id)}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <p className="font-medium text-white truncate">{order.serviceName}</p>
                          <Badge variant="info" className="text-[11px]">{order.category}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/35">
                          <span className="font-mono">{order.orderNumber}</span>
                          <span>{order.clientName || "Unknown client"}</span>
                          <span>{order.clientEmail || "No email"}</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} />
                      <span className="text-sm font-mono font-bold text-brand-300 min-w-[95px] text-left lg:text-right">
                        {formatCurrency(order.pricing?.totalAmount || order.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass rounded-[26px] p-6">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Order Controls</p>
              <h2 className="text-2xl font-display font-bold text-white">
                {selectedOrder ? selectedOrder.orderNumber : "Select an order"}
              </h2>
            </div>
            {selectedOrder && <StatusBadge status={selectedOrder.status} />}
          </div>

          {!selectedOrder ? (
            <div className="text-sm text-white/40 py-10">
              Select an order from the list to inspect it.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{selectedOrder.serviceName}</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-3 text-sm">
                  <MiniInfo label="Client" value={selectedOrder.clientName || "-"} />
                  <MiniInfo label="Email" value={selectedOrder.clientEmail || "-"} />
                  <MiniInfo label="Amount" value={formatCurrency(selectedOrder.pricing?.totalAmount || selectedOrder.amount)} />
                  <MiniInfo label="Documents" value={selectedOrder.documents?.length || 0} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <SelectField disabled={!canManageOrders} label="Order Status" value={form.status} onChange={setField("status")} options={STATUS_FILTERS.filter((item) => item !== "All")} />
                <SelectField disabled={!canManageOrders} label="Payment Status" value={form.paymentStatus} onChange={setField("paymentStatus")} options={PAYMENT_FILTERS.filter((item) => item !== "All")} />
              </div>

              <Input
                disabled={!canManageOrders}
                label="Assigned CA / Team"
                value={form.assignedTo}
                onChange={setField("assignedTo")}
                placeholder="FastSewa CA Team"
              />

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Client Update / Latest Note</label>
                <textarea
                  rows={6}
                  disabled={!canManageOrders}
                  value={form.notes}
                  onChange={setField("notes")}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none disabled:opacity-60"
                  placeholder="Share the latest client-facing update for this order..."
                />
              </div>

              {canManageOrders ? (
                <div className="flex flex-wrap gap-3">
                  <Button loading={saving} onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => navigate(`/dashboard/orders/${selectedOrder.id}`)}>
                    Open Full Detail
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate(`/dashboard/orders/${selectedOrder.id}`)}>
                    Open Full Detail
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {selectedOrder.timeline.map((step) => (
                  <span
                    key={step.status}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border",
                      step.done
                        ? "border-brand-500/20 bg-brand-500/10 text-brand-300"
                        : "border-white/10 text-white/35"
                    )}
                  >
                    {step.status}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function DeskStat({ label, value, tone, icon: Icon }) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", tone)}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  )
}

function SelectField({ label, value, onChange, options, disabled }) {
  return (
    <div>
      <label className="text-sm font-medium text-white/70 block mb-1.5">{label}</label>
      <select
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all disabled:opacity-60"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#121212]">
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

function MiniInfo({ label, value }) {
  return (
    <div>
      <p className="text-xs text-white/30 mb-1">{label}</p>
      <p className="text-sm text-white/75">{value}</p>
    </div>
  )
}
