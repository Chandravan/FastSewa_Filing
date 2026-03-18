import { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, FileText, Bell, User, LogOut,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
  ArrowRight, Plus, ChevronRight, IndianRupee
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button, Card, StatusBadge, Badge } from "@/components/ui"
import { MOCK_ORDERS, COMPLIANCE_REMINDERS, STATS } from "@/data/mockData"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

export default function DashboardPage() {
  const { user, logout, restoreSession } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    restoreSession()
  }, [])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/40 mb-4">Please sign in to access your dashboard</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 flex">
      <Sidebar user={user} logout={logout} navigate={navigate} />

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-64 px-6 py-8 max-w-5xl">
        {/* Greeting */}
        <div className="mb-8 animate-fade-up">
          <h1 className="text-3xl font-display font-bold text-white">
            Good morning, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="text-white/40 mt-1">Here's an overview of your compliance status.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Total Orders" value={STATS.totalOrders} color="text-blue-400" bg="bg-blue-500/10" />
          <StatCard icon={CheckCircle2} label="Completed" value={STATS.completedOrders} color="text-green-400" bg="bg-green-500/10" />
          <StatCard icon={Clock} label="In Progress" value={STATS.processingOrders} color="text-orange-400" bg="bg-orange-500/10" />
          <StatCard icon={IndianRupee} label="Total Spent" value={formatCurrency(STATS.totalSpent)} color="text-brand-400" bg="bg-brand-500/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent orders */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">Recent Orders</h2>
              <Link to="/dashboard/orders" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
                View all <ChevronRight size={14} />
              </Link>
            </div>

            {MOCK_ORDERS.map((order, i) => (
              <OrderCard key={order.id} order={order} delay={i * 80} navigate={navigate} />
            ))}

            <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/services")}>
              <Plus size={15} /> Place New Order
            </Button>
          </div>

          {/* Compliance reminders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-white text-lg">Upcoming Deadlines</h2>
              <Bell size={16} className="text-white/30" />
            </div>
            <div className="space-y-3">
              {COMPLIANCE_REMINDERS.map((r) => (
                <ReminderCard key={r.id} reminder={r} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function Sidebar({ user, logout, navigate }) {
  const navItems = [
    { icon: LayoutDashboard, label: "Overview", to: "/dashboard" },
    { icon: FileText, label: "My Orders", to: "/dashboard/orders" },
    { icon: Bell, label: "Reminders", to: "/dashboard/reminders" },
    { icon: User, label: "Profile", to: "/dashboard/profile" },
  ]

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-20 bottom-0 w-64 glass border-r border-white/8 p-4">
      {/* User info */}
      <div className="flex items-center gap-3 p-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
          <span className="text-brand-400 font-bold text-sm font-mono">
            {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
          <p className="text-xs text-white/35 truncate max-w-[140px]">{user.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
              location.pathname === to
                ? "bg-brand-500/15 text-brand-400 border border-brand-500/20"
                : "text-white/50 hover:text-white hover:bg-white/5"
            )}
          >
            <Icon size={16} /> {label}
          </Link>
        ))}
      </nav>

      <button
        onClick={() => { logout(); navigate("/") }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/30 hover:text-red-400 hover:bg-red-500/5 transition-all mt-2"
      >
        <LogOut size={16} /> Sign out
      </button>
    </aside>
  )
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="glass rounded-xl p-4 flex items-start gap-3 animate-fade-up">
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
        <Icon size={16} className={color} />
      </div>
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-lg font-bold font-mono text-white leading-tight">{value}</p>
      </div>
    </div>
  )
}

function OrderCard({ order, delay, navigate }) {
  return (
    <div
      className="glass glass-hover rounded-xl p-4 cursor-pointer animate-fade-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{order.serviceName}</p>
          <p className="text-xs text-white/35 mt-0.5">{order.id} · {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={order.status} />
          <span className="text-sm font-mono font-bold text-brand-400">{formatCurrency(order.amount)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="flex gap-1">
          {order.timeline.map((step, i) => (
            <div
              key={i}
              className={cn("flex-1 h-1 rounded-full", step.done ? "bg-brand-500" : "bg-white/10")}
            />
          ))}
        </div>
        <p className="text-xs text-white/25 mt-1.5">
          {order.timeline.filter(t => t.done).length}/{order.timeline.length} steps done
        </p>
      </div>
    </div>
  )
}

function ReminderCard({ reminder }) {
  const urgentClass = reminder.urgent
    ? "border-red-500/25 bg-red-500/5"
    : "border-white/8 bg-white/3"

  return (
    <div className={cn("rounded-xl p-4 border", urgentClass)}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            {reminder.urgent && <AlertCircle size={13} className="text-red-400 shrink-0" />}
            <p className="text-sm font-medium text-white truncate">{reminder.title}</p>
          </div>
          <p className="text-xs text-white/35">{reminder.description}</p>
        </div>
        <span className={cn(
          "text-xs font-mono font-bold shrink-0 px-2 py-0.5 rounded-lg",
          reminder.urgent ? "bg-red-500/15 text-red-400" : "bg-white/8 text-white/50"
        )}>
          {reminder.daysLeft}d
        </span>
      </div>
      <p className="text-xs text-white/25 mt-2">Due: {reminder.dueDate}</p>
    </div>
  )
}
