import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, Clock3, Inbox, Mail, RefreshCw, Search } from "lucide-react"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { hasPermission } from "@/lib/adminPermissions"
import { contactApi } from "@/lib/api"
import { notifyError, notifySuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"

const STATUS_FILTERS = ["All", "new", "in_progress", "closed"]
const STATUS_OPTIONS = ["new", "in_progress", "closed"]
const EMPTY_STATS = {
  total: 0,
  new: 0,
  inProgress: 0,
  closed: 0,
}

function formatDateTime(value) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function toReadableStatus(status) {
  if (status === "in_progress") return "In Progress"
  if (status === "closed") return "Closed"
  return "New"
}

function statusStyles(status) {
  if (status === "closed") return "border-green-500/25 bg-green-500/12 text-green-300"
  if (status === "in_progress") return "border-blue-500/25 bg-blue-500/12 text-blue-300"
  return "border-yellow-500/25 bg-yellow-500/12 text-yellow-300"
}

function computeStats(items) {
  const total = items.length
  const newCount = items.filter((item) => item.status === "new").length
  const inProgress = items.filter((item) => item.status === "in_progress").length
  const closed = items.filter((item) => item.status === "closed").length

  return {
    total,
    new: newCount,
    inProgress,
    closed,
  }
}

export default function AdminContactInquiriesPage() {
  const { user } = useAuth()
  const canManageInquiries = hasPermission(user, "inquiries.manage")

  const [items, setItems] = useState([])
  const [stats, setStats] = useState(EMPTY_STATS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState("")
  const [form, setForm] = useState({
    status: "new",
    adminNotes: "",
  })

  async function loadInquiries() {
    setLoading(true)
    try {
      const data = await contactApi.listInquiries()
      const nextItems = data.items || []
      setItems(nextItems)
      setStats(data.stats || computeStats(nextItems))
      setSelectedId((current) => (
        current && nextItems.some((item) => item.id === current)
          ? current
          : (nextItems[0]?.id || "")
      ))
      setError("")
    } catch (requestError) {
      setError(requestError.message || "Unable to load contact inquiries.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInquiries()
  }, [])

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchStatus = statusFilter === "All" || item.status === statusFilter
      const matchSearch = !query || [
        item.name,
        item.email,
        item.message,
        item.adminNotes,
      ].filter(Boolean).some((value) => value.toLowerCase().includes(query))

      return matchStatus && matchSearch
    })
  }, [items, search, statusFilter])

  const selectedInquiry = filteredItems.find((item) => item.id === selectedId)
    || items.find((item) => item.id === selectedId)
    || null

  useEffect(() => {
    if (!selectedInquiry) {
      setForm({ status: "new", adminNotes: "" })
      return
    }

    setForm({
      status: selectedInquiry.status || "new",
      adminNotes: selectedInquiry.adminNotes || "",
    })
  }, [selectedInquiry])

  const setField = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function handleSave() {
    if (!selectedInquiry || !canManageInquiries) return

    setSaving(true)
    try {
      const data = await contactApi.updateInquiry(selectedInquiry.id, {
        status: form.status,
        adminNotes: form.adminNotes,
      })
      const updatedInquiry = data.inquiry
      const nextItems = items.map((item) => (item.id === updatedInquiry.id ? updatedInquiry : item))
      setItems(nextItems)
      setStats(computeStats(nextItems))
      setError("")
      notifySuccess(data.message || "Inquiry updated successfully.")
    } catch (requestError) {
      notifyError(requestError, "Unable to save inquiry updates.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminShell
      badge="Support Workspace"
      title="Contact Desk"
      description="Track website contact requests and resolve them with status updates and internal notes."
      actions={(
        <Button variant="outline" className="gap-2" onClick={loadInquiries} loading={loading}>
          Refresh <RefreshCw size={14} />
        </Button>
      )}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {!canManageInquiries && (
        <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-5 py-4 text-sm text-blue-200">
          You currently have read-only inquiry access. Grant `inquiries.manage` to update status or notes.
        </div>
      )}

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Inbox} label="Total Inquiries" value={stats.total} tone="bg-white/10 text-white/80" />
        <StatCard icon={Mail} label="New" value={stats.new} tone="bg-yellow-500/10 text-yellow-300" />
        <StatCard icon={Clock3} label="In Progress" value={stats.inProgress} tone="bg-blue-500/10 text-blue-300" />
        <StatCard icon={CheckCircle2} label="Closed" value={stats.closed} tone="bg-green-500/10 text-green-300" />
      </section>

      <div className="grid xl:grid-cols-[1.12fr,0.88fr] gap-6">
        <section className="glass rounded-[26px] p-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, email, message, or notes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm font-medium transition-all",
                    statusFilter === status ? "bg-brand-500 text-white" : "glass text-white/50 hover:text-white"
                  )}
                >
                  {status === "All" ? status : toReadableStatus(status)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-white/40 py-10">Loading contact inquiries...</div>
            ) : filteredItems.length === 0 ? (
              <div className="text-sm text-white/40 py-10">No inquiries found for the current filters.</div>
            ) : (
              filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-4 text-left transition-all",
                    selectedInquiry?.id === item.id
                      ? "border-brand-500/25 bg-brand-500/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-white/45 truncate mt-0.5">{item.email}</p>
                    </div>
                    <Badge className={cn("text-[11px] border", statusStyles(item.status))}>
                      {toReadableStatus(item.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-white/50 line-clamp-2">{item.message}</p>
                  <p className="mt-3 text-xs text-white/30">{formatDateTime(item.createdAt)}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="glass rounded-[26px] p-6">
          {!selectedInquiry ? (
            <div className="text-sm text-white/40 py-10">
              Select an inquiry from the left panel to review full details.
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">Inquiry Detail</p>
                  <h2 className="text-2xl font-display font-bold text-white">{selectedInquiry.name}</h2>
                  <a
                    href={`mailto:${selectedInquiry.email}`}
                    className="text-sm text-brand-300 hover:text-brand-200 transition-colors"
                  >
                    {selectedInquiry.email}
                  </a>
                </div>
                <Badge className={cn("text-xs border", statusStyles(selectedInquiry.status))}>
                  {toReadableStatus(selectedInquiry.status)}
                </Badge>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 space-y-2 text-sm text-white/60">
                <p>
                  <span className="text-white/40">Created:</span> {formatDateTime(selectedInquiry.createdAt)}
                </p>
                <p>
                  <span className="text-white/40">Last updated:</span> {formatDateTime(selectedInquiry.updatedAt)}
                </p>
                <p>
                  <span className="text-white/40">Source:</span> {selectedInquiry.source || "website"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/35 mb-2">Client message</p>
                <p className="text-sm leading-relaxed text-white/75 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={setField("status")}
                  disabled={!canManageInquiries}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all disabled:opacity-60"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[#121212]">
                      {toReadableStatus(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70 block mb-1.5">Internal notes</label>
                <textarea
                  rows={7}
                  value={form.adminNotes}
                  onChange={setField("adminNotes")}
                  disabled={!canManageInquiries}
                  className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 px-4 py-3 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none disabled:opacity-60"
                  placeholder="Add follow-up notes, callback updates, or resolution details..."
                />
              </div>

              {canManageInquiries && (
                <Button onClick={handleSave} loading={saving}>
                  Save Inquiry Update
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  )
}

function StatCard({ label, value, tone, icon: Icon }) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-3", tone)}>
        <Icon size={18} />
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  )
}
