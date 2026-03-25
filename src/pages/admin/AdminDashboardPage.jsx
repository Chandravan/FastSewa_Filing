import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Activity,
  ArrowRight,
  Bell,
  CircleAlert,
  Clock3,
  CreditCard,
  FileText,
  IndianRupee,
  Layers3,
  ShieldCheck,
  TrendingUp,
  Users2,
} from "lucide-react"
import AdminShell from "@/components/admin/AdminShell"
import { Badge, Button, StatusBadge } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { hasAnyPermission, hasPermission } from "@/lib/adminPermissions"
import { dashboardApi } from "@/lib/api"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

const INITIAL_OVERVIEW = {
  stats: {
    totalOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
    pendingOrders: 0,
    billedRevenue: 0,
    collectedRevenue: 0,
    pendingRevenue: 0,
    totalClients: 0,
    activeClients: 0,
    newClientsThisMonth: 0,
    activeServices: 0,
    collectionRate: 0,
    averageTicketSize: 0,
  },
  queue: [],
  paymentBreakdown: {
    paid: 0,
    pending: 0,
    failed: 0,
  },
  topServices: [],
  recentOrders: [],
  reminders: [],
}

const TONE_STYLES = {
  amber: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  orange: "bg-orange-500/10 text-orange-300 border-orange-500/20",
  green: "bg-green-500/10 text-green-300 border-green-500/20",
  red: "bg-red-500/10 text-red-300 border-red-500/20",
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const canOpenOrders = hasAnyPermission(user, ["orders.view", "orders.manage", "orders.bulk"])
  const canOpenServices = hasAnyPermission(user, ["services.view", "services.manage", "services.archive", "services.restore", "services.bulk"])
  const canOpenAudit = hasPermission(user, "audit.view")
  const [overview, setOverview] = useState(INITIAL_OVERVIEW)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadAdminOverview() {
      setLoading(true)
      try {
        const data = await dashboardApi.getAdminOverview()
        if (!active) return
        setOverview(data)
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

    loadAdminOverview()

    return () => {
      active = false
    }
  }, [])

  const headlineDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date())

  const hero = (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_36%),rgba(255,255,255,0.035)] p-6 md:p-8 mb-8">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.03),transparent)]" />
      <div className="relative flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <Badge variant="brand" className="mb-4">Admin Control Tower</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Operations stay clean when the cockpit stays visible.
          </h1>
          <p className="text-white/50 mt-3 max-w-xl">
            Track orders, revenue, payment pressure, service demand, and user activity from one place.
            This is the daily command surface for FastSewa admins.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-6 text-sm text-white/40">
            <span>{headlineDate}</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>{overview.stats.totalOrders} total orders under watch</span>
            <span className="w-1 h-1 rounded-full bg-white/15" />
            <span>{overview.stats.activeClients} active clients in the last 30 days</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 xl:w-[420px]">
          <SignalTile
            icon={IndianRupee}
            label="Collected Revenue"
            value={formatCurrency(overview.stats.collectedRevenue)}
            accent="text-brand-300"
            tone="from-brand-500/20 to-brand-500/5"
          />
          <SignalTile
            icon={ShieldCheck}
            label="Collection Rate"
            value={`${overview.stats.collectionRate}%`}
            accent="text-green-300"
            tone="from-green-500/20 to-green-500/5"
          />
          <SignalTile
            icon={Users2}
            label="Client Base"
            value={overview.stats.totalClients}
            accent="text-blue-300"
            tone="from-blue-500/20 to-blue-500/5"
          />
          <SignalTile
            icon={Layers3}
            label="Live Services"
            value={overview.stats.activeServices}
            accent="text-yellow-300"
            tone="from-yellow-500/20 to-yellow-500/5"
          />
        </div>
      </div>
    </section>
  )

  return (
    <AdminShell hero={hero}>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={FileText}
          label="Orders Managed"
          value={overview.stats.totalOrders}
          hint={`${overview.stats.processingOrders} currently moving`}
          tone="bg-blue-500/10 text-blue-300"
        />
        <MetricCard
          icon={TrendingUp}
          label="Avg. Ticket Size"
          value={formatCurrency(overview.stats.averageTicketSize)}
          hint={`${overview.stats.newClientsThisMonth} new clients this month`}
          tone="bg-green-500/10 text-green-300"
        />
        <MetricCard
          icon={CreditCard}
          label="Pending Billing"
          value={formatCurrency(overview.stats.pendingRevenue)}
          hint={`${overview.paymentBreakdown.pending} orders awaiting collection`}
          tone="bg-yellow-500/10 text-yellow-300"
        />
        <MetricCard
          icon={Activity}
          label="Completed Orders"
          value={overview.stats.completedOrders}
          hint={`${overview.stats.pendingOrders} still waiting in queue`}
          tone="bg-orange-500/10 text-orange-300"
        />
      </section>

      <section className="grid xl:grid-cols-[1.55fr,1fr] gap-6 mb-6">
        <div className="glass rounded-[26px] p-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Recent Flow</p>
              <h2 className="text-2xl font-display font-bold text-white">Latest client orders</h2>
              <p className="text-sm text-white/40 mt-1">Open any row to jump straight into the order desk.</p>
            </div>
            {canOpenOrders && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/admin/orders")}>
                Open Order Desk <ArrowRight size={14} />
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-sm text-white/40 py-10">Loading admin order feed...</div>
          ) : overview.recentOrders.length === 0 ? (
            <div className="text-sm text-white/40 py-10">No live orders yet. Once clients start placing orders, the desk will populate here.</div>
          ) : (
            <div className="space-y-3">
              {overview.recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => { if (canOpenOrders) navigate(`/dashboard/orders/${order.id}`) }}
                  className="w-full text-left rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.05] hover:border-brand-500/20 px-4 py-4 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <p className="font-medium text-white truncate">{order.serviceName}</p>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/6 text-white/40 border border-white/8">
                          {order.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/35">
                        <span className="font-mono">{order.orderNumber}</span>
                        <span>{order.clientName}</span>
                        <span className="truncate">{order.clientEmail}</span>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <StatusBadge status={order.status} />
                      <StatusBadge status={order.paymentStatus} />
                      <span className="text-sm font-mono font-bold text-brand-300 min-w-[96px] text-left lg:text-right">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-[26px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Service Momentum</p>
            <div className="flex items-end justify-between gap-3 mb-5">
              <h2 className="text-2xl font-display font-bold text-white">What clients are buying</h2>
              <span className="text-sm text-white/35">{overview.topServices.length} tracked services</span>
            </div>

            <div className="space-y-4">
              {overview.topServices.map((service, index) => (
                <ServiceRow
                  key={service.serviceName}
                  service={service}
                  maxOrders={overview.topServices[0]?.orders || 1}
                  rank={index + 1}
                />
              ))}

              {!loading && overview.topServices.length === 0 && (
                <p className="text-sm text-white/40">Service demand will show up once order traffic starts.</p>
              )}
            </div>
          </div>

          <div className="glass rounded-[26px] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Cash Flow</p>
            <h2 className="text-2xl font-display font-bold text-white mb-5">Payment health snapshot</h2>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <PaymentMini label="Paid" value={overview.paymentBreakdown.paid} tone="status-paid" />
              <PaymentMini label="Pending" value={overview.paymentBreakdown.pending} tone="status-pending" />
              <PaymentMini label="Failed" value={overview.paymentBreakdown.failed} tone="status-failed" />
            </div>

            <div className="space-y-3">
              <MoneyLine label="Total billed" value={overview.stats.billedRevenue} accent="text-white" />
              <MoneyLine label="Collected" value={overview.stats.collectedRevenue} accent="text-brand-300" />
              <MoneyLine label="Still at risk" value={overview.stats.pendingRevenue} accent="text-yellow-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-[1.08fr,0.92fr] gap-6">
        <div className="glass rounded-[26px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Execution Queue</p>
          <div className="flex items-end justify-between gap-3 mb-6">
            <h2 className="text-2xl font-display font-bold text-white">Where attention is needed</h2>
            {canOpenOrders && (
              <Link to="/admin/orders" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                View all orders
              </Link>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {overview.queue.map((item) => (
              <QueueCard key={item.id} item={item} maxValue={Math.max(...overview.queue.map((entry) => entry.value), 1)} />
            ))}
          </div>
        </div>

        <div className="glass rounded-[26px] p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-2">Alerts & Notes</p>
              <h2 className="text-2xl font-display font-bold text-white">Compliance watchlist</h2>
            </div>
            <Bell size={18} className="text-white/30" />
          </div>

          <div className="space-y-3 mb-5">
            {overview.reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={cn(
                  "rounded-2xl border px-4 py-4",
                  reminder.urgent
                    ? "border-red-500/20 bg-red-500/10"
                    : "border-white/8 bg-white/[0.03]"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {reminder.urgent && <CircleAlert size={14} className="text-red-300 shrink-0" />}
                      <p className="text-sm font-medium text-white">{reminder.title}</p>
                    </div>
                    <p className="text-xs text-white/40 leading-relaxed">{reminder.description}</p>
                  </div>
                  <span className="shrink-0 text-xs font-mono rounded-lg bg-white/8 px-2 py-1 text-white/55">
                    {reminder.daysLeft}d
                  </span>
                </div>
              </div>
            ))}

            {!loading && overview.reminders.length === 0 && (
              <p className="text-sm text-white/40">No reminders right now. You're clear for the moment.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/30 mb-3">Quick actions</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {canOpenOrders && (
                <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/orders")}>
                  Review Orders <ArrowRight size={14} />
                </Button>
              )}
              {canOpenServices && (
                <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/services")}>
                  Service Studio <ArrowRight size={14} />
                </Button>
              )}
              {canOpenAudit && (
                <Button variant="outline" className="justify-between" onClick={() => navigate("/admin/audit")}>
                  Audit Trail <ArrowRight size={14} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </AdminShell>
  )
}

function SignalTile({ icon: Icon, label, value, accent, tone }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-gradient-to-br p-4", tone)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
        <Icon size={15} className={accent} />
      </div>
      <p className="text-2xl font-display font-bold text-white">{value}</p>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <div className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", tone)}>
          <Icon size={18} />
        </div>
        <span className="text-[11px] uppercase tracking-[0.2em] text-white/25">Live</span>
      </div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/30 mb-2">{label}</p>
      <p className="text-3xl font-display font-bold text-white">{value}</p>
      <p className="text-sm text-white/40 mt-2">{hint}</p>
    </div>
  )
}

function ServiceRow({ service, maxOrders, rank }) {
  const width = service.orders > 0
    ? `${Math.max(18, Math.round((service.orders / maxOrders) * 100))}%`
    : "0%"

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-brand-300">#{rank}</span>
            <p className="text-sm font-medium text-white truncate">{service.serviceName}</p>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{service.category || "General"}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-white">{service.orders} orders</p>
          <p className="text-xs text-brand-300">{formatCurrency(service.revenue)}</p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 via-orange-400 to-yellow-300" style={{ width }} />
      </div>
    </div>
  )
}

function PaymentMini({ label, value, tone }) {
  return (
    <div className={cn("rounded-2xl border px-3 py-3 text-center", tone)}>
      <p className="text-[11px] uppercase tracking-[0.2em] opacity-80">{label}</p>
      <p className="text-xl font-display font-bold mt-1">{value}</p>
    </div>
  )
}

function MoneyLine({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-white/45">{label}</span>
      <span className={cn("text-sm font-mono font-bold", accent)}>{formatCurrency(value)}</span>
    </div>
  )
}

function QueueCard({ item, maxValue }) {
  const width = item.value > 0
    ? `${Math.max(10, Math.round((item.value / maxValue) * 100))}%`
    : "0%"

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs", TONE_STYLES[item.tone] || TONE_STYLES.amber)}>
          {item.label}
        </span>
        <span className="text-lg font-display font-bold text-white">{item.value}</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full",
            item.tone === "green" && "bg-green-400",
            item.tone === "orange" && "bg-orange-400",
            item.tone === "red" && "bg-red-400",
            item.tone === "amber" && "bg-yellow-400"
          )}
          style={{ width }}
        />
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-white/35">
        <Clock3 size={12} />
        <span>Keep this lane moving before end-of-day handoff.</span>
      </div>
    </div>
  )
}
