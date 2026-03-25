import { useEffect, useMemo, useState } from "react"
import { Activity, ClipboardList, History, Search, ShieldCheck } from "lucide-react"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button } from "@/components/ui"
import { auditApi } from "@/lib/api"
import { cn, formatDate } from "@/lib/utils"

const ENTITY_FILTERS = ["All", "order", "service", "user", "system"]

export default function AdminAuditPage() {
  const [audit, setAudit] = useState({
    items: [],
    summary: {
      total: 0,
      today: 0,
      entityCounts: [],
      recentActions: [],
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [entityType, setEntityType] = useState("All")

  useEffect(() => {
    let active = true

    async function loadAuditLogs() {
      setLoading(true)
      try {
        const data = await auditApi.list({
          entityType,
          search,
          limit: 80,
        })
        if (!active) return
        setAudit(data)
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

    loadAuditLogs()

    return () => {
      active = false
    }
  }, [entityType, search])

  const entitySummary = useMemo(() => {
    const map = new Map(audit.summary.entityCounts.map((entry) => [entry._id, entry.count]))
    return {
      order: map.get("order") || 0,
      service: map.get("service") || 0,
      user: map.get("user") || 0,
      system: map.get("system") || 0,
    }
  }, [audit.summary.entityCounts])

  return (
    <AdminShell
      badge="Audit & Trace"
      title="Audit Trail"
      description="Search every admin-side action across orders, users, services, and system events."
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <AuditStat label="Visible Events" value={audit.summary.total} tone="bg-blue-500/10 text-blue-300" icon={History} />
        <AuditStat label="Events Today" value={audit.summary.today} tone="bg-green-500/10 text-green-300" icon={Activity} />
        <AuditStat label="Order Events" value={entitySummary.order} tone="bg-orange-500/10 text-orange-300" icon={ClipboardList} />
        <AuditStat label="User Events" value={entitySummary.user} tone="bg-brand-500/10 text-brand-300" icon={ShieldCheck} />
      </div>

      <section className="glass rounded-[26px] p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by actor, action, summary, or target..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {ENTITY_FILTERS.map((entity) => (
              <button
                key={entity}
                onClick={() => setEntityType(entity)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                  entityType === entity ? "bg-brand-500 text-white" : "glass text-white/45 hover:text-white"
                )}
              >
                {entity}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 mb-5">
          <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-3">Most frequent actions in this view</p>
          <div className="flex flex-wrap gap-2">
            {audit.summary.recentActions.map((action) => (
              <Badge key={action._id} variant="info" className="gap-1">
                {action._id} · {action.count}
              </Badge>
            ))}
            {!loading && audit.summary.recentActions.length === 0 && (
              <span className="text-sm text-white/35">No audit events match the current filters yet.</span>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-white/40 py-10">Loading audit events...</div>
        ) : audit.items.length === 0 ? (
          <div className="text-sm text-white/40 py-10">No audit events matched the current filters.</div>
        ) : (
          <div className="space-y-3">
            {audit.items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="brand">{item.entityType}</Badge>
                      <Badge variant="default">{item.action}</Badge>
                      {item.entityLabel && <Badge variant="info">{item.entityLabel}</Badge>}
                    </div>
                    <p className="text-sm font-medium text-white">{item.summary}</p>
                    <p className="text-xs text-white/35 mt-1">
                      {item.actorSnapshot?.name || "Unknown actor"} · {item.actorSnapshot?.email || "No email"} · {formatDate(item.createdAt)}
                    </p>
                    {item.metadata && (
                      <div className="mt-3 rounded-xl border border-white/8 bg-black/10 p-3 text-xs text-white/45">
                        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(item.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white/30 shrink-0">
                    <p>{item.ipAddress || "No IP captured"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  )
}

function AuditStat({ label, value, tone, icon: Icon }) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center mb-4", tone)}>
        <Icon size={18} />
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
    </div>
  )
}
