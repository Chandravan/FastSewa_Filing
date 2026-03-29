import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  Layers3,
  LogOut,
  Mail,
  ShieldCheck,
  User,
  Users2,
} from "lucide-react"
import { Badge } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { hasAnyPermission, hasPermission } from "@/lib/adminPermissions"
import { cn, getInitials } from "@/lib/utils"

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Control Tower", to: "/admin", permissions: ["dashboard.view"] },
  { icon: FileText, label: "Order Desk", to: "/admin/orders", permissions: ["orders.view", "orders.manage", "orders.bulk"] },
  { icon: Layers3, label: "Service Studio", to: "/admin/services", permissions: ["services.view", "services.manage", "services.archive", "services.restore", "services.bulk"] },
  { icon: Users2, label: "User Desk", to: "/admin/users", permissions: ["users.view", "users.manage", "users.disable", "users.delete", "users.bulk"] },
  { icon: Mail, label: "Contact Desk", to: "/admin/inquiries", permissions: ["inquiries.view", "inquiries.manage"] },
  { icon: ClipboardList, label: "Audit Trail", to: "/admin/audit", permissions: ["audit.view"] },
  { icon: User, label: "Profile", to: "/dashboard/profile" },
]

function isNavItemActive(pathname, to) {
  return pathname === to || (to !== "/admin" && pathname.startsWith(to))
}

export default function AdminShell({ badge = "Admin Workspace", title, description, actions, hero, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!user) {
    return null
  }

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permissions || hasAnyPermission(user, item.permissions))
  const accessLabel = hasPermission(user, "dashboard.view") && user.permissions?.includes?.("*")
    ? "Full platform access"
    : "Scoped admin access"
  const activeNavItem = visibleNavItems.find((item) => isNavItemActive(location.pathname, item.to)) || null

  return (
    <div className="min-h-screen pt-20 flex">
      <aside className="hidden md:flex flex-col fixed left-0 top-20 bottom-0 w-72 border-r border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))] backdrop-blur-xl p-5">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
              <span className="text-brand-400 font-mono font-bold">{getInitials(user.name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/35 truncate">{user.email}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs text-brand-300 flex items-center gap-2">
            <ShieldCheck size={14} /> {accessLabel}
          </div>
        </div>

        <nav className="flex flex-col gap-1.5 flex-1">
          {visibleNavItems.map(({ icon: Icon, label, to }) => {
            const active = isNavItemActive(location.pathname, to)

            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                  active
                    ? "border border-brand-500/20 bg-brand-500/12 text-brand-300"
                    : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon size={16} /> {label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => { logout(); navigate("/") }}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-white/35 hover:text-red-300 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </aside>

      <main className="flex-1 ml-0 md:ml-72 px-5 md:px-8 py-8 max-w-[1400px] w-full">
        <div className="md:hidden sticky top-24 z-20 mb-5 space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.035))] backdrop-blur-xl px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center shrink-0">
                  <span className="text-brand-400 font-mono font-bold">{getInitials(user.name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-white/30 mb-1">Admin Workspace</p>
                  <p className="text-sm font-semibold text-white truncate">{activeNavItem?.label || title || "Admin Panel"}</p>
                </div>
              </div>
              <button
                onClick={() => { logout(); navigate("/") }}
                className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-white/45 hover:text-red-300 hover:border-red-500/20 hover:bg-red-500/10 transition-all shrink-0"
                aria-label="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-brand-500/20 bg-brand-500/10 px-3 py-2 text-xs text-brand-300 min-w-0">
                <ShieldCheck size={14} className="shrink-0" />
                <span className="truncate">{accessLabel}</span>
              </div>
              <span className="text-xs text-white/30 truncate">{user.email}</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-[rgba(10,10,10,0.72)] backdrop-blur-xl p-2">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {visibleNavItems.map(({ icon: Icon, label, to }) => {
                const active = isNavItemActive(location.pathname, to)

                return (
                  <Link
                    key={to}
                    to={to}
                    className={cn(
                      "min-w-max flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "border border-brand-500/20 bg-brand-500/12 text-brand-300"
                        : "border border-transparent bg-white/[0.03] text-white/50 hover:text-white hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon size={15} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {hero || (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
            <div>
              <Badge variant="brand" className="mb-3">{badge}</Badge>
              <h1 className="text-4xl font-display font-bold text-white">{title}</h1>
              {description && <p className="text-white/45 mt-2 max-w-2xl">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
