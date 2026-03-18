import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { FileText, Search, Filter, ArrowRight, Clock } from "lucide-react"
import { Button, StatusBadge, EmptyState, Badge } from "@/components/ui"
import { MOCK_ORDERS } from "@/data/mockData"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const STATUS_FILTERS = ["All", "pending", "processing", "completed", "cancelled"]

export default function OrdersPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = MOCK_ORDERS.filter((o) => {
    const matchStatus = statusFilter === "All" || o.status === statusFilter
    const matchSearch = o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="min-h-screen pt-24 pb-20 md:pl-64">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Orders</h1>
            <p className="text-white/40 mt-1">{MOCK_ORDERS.length} total orders</p>
          </div>
          <Button onClick={() => navigate("/services")} size="sm" className="gap-1.5">
            New Order <ArrowRight size={14} />
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              placeholder="Search by service or order ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium capitalize transition-all",
                  statusFilter === s ? "bg-brand-500 text-white" : "glass text-white/45 hover:text-white"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Orders */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No orders found"
            description="Try adjusting your filters or place a new order."
            action={<Button onClick={() => navigate("/services")}>Browse Services</Button>}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((order, i) => (
              <OrderRow key={order.id} order={order} delay={i * 60} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OrderRow({ order, delay, navigate }) {
  const stepsCompleted = order.timeline.filter(t => t.done).length
  const totalSteps = order.timeline.length
  const progress = Math.round((stepsCompleted / totalSteps) * 100)

  return (
    <div
      className="glass glass-hover rounded-xl p-5 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
            <FileText size={16} className="text-brand-400" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-white truncate">{order.serviceName}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-white/35 font-mono">{order.id}</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/35 flex items-center gap-1">
                <Clock size={10} /> {formatDate(order.createdAt)}
              </span>
              {order.assignedTo && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/35">CA: {order.assignedTo}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:shrink-0">
          <div className="text-right">
            <p className="font-bold font-mono text-brand-400">{formatCurrency(order.amount)}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ Payment pending"}
            </p>
          </div>
          <StatusBadge status={order.status} />
          <ArrowRight size={16} className="text-white/20" />
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-white/30 font-mono shrink-0">{stepsCompleted}/{totalSteps}</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {order.timeline.map((step, i) => (
            <span key={i} className={cn("text-xs px-2 py-0.5 rounded-md", step.done ? "bg-brand-500/15 text-brand-400" : "bg-white/5 text-white/20")}>
              {step.status.split(" ").slice(0, 2).join(" ")}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
