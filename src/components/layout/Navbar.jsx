import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Menu, X, ChevronDown, Bell, LogOut, User, LayoutDashboard, FileText, ShieldCheck } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui"
import { getPrimaryAdminRoute, hasAnyPermission } from "@/lib/adminPermissions"
import { cn, getInitials } from "@/lib/utils"

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isActive = (path) => location.pathname === path
  const primaryDashboardPath = user?.role === "admin" ? getPrimaryAdminRoute(user) : "/dashboard"
  const canAccessAdminOrders = hasAnyPermission(user, ["orders.view", "orders.manage", "orders.bulk"])
  const ordersPath = user?.role === "admin"
    ? (canAccessAdminOrders ? "/admin/orders" : primaryDashboardPath)
    : "/dashboard/orders"
  const dashboardNavActive = user?.role === "admin"
    ? location.pathname.startsWith("/admin")
    : isActive("/dashboard")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
    setProfileOpen(false)
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "glass border-b border-white/8 py-3" : "py-5"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center brand-glow group-hover:scale-105 transition-transform">
            <span className="text-white font-display font-bold text-sm">F</span>
          </div>
          <span className="font-display font-bold text-white text-lg">
            Fast<span className="text-gradient">Sewa</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/services" active={isActive("/services")}>Services</NavLink>
          <NavLink to="/pricing" active={isActive("/pricing")}>Pricing</NavLink>
          <NavLink to="/about" active={isActive("/about")}>About</NavLink>
          {user && <NavLink to={primaryDashboardPath} active={dashboardNavActive}>{user.role === "admin" ? "Admin Panel" : "Dashboard"}</NavLink>}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications */}
              <button className="relative w-9 h-9 glass rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors">
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2.5 glass rounded-lg px-3 py-2 hover:border-white/20 transition-all"
                >
                  <div className="w-7 h-7 rounded-md bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                    <span className="text-brand-400 text-xs font-semibold font-mono">{getInitials(user.name)}</span>
                  </div>
                  <span className="text-sm text-white/80 font-medium">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className={cn("text-white/40 transition-transform", profileOpen && "rotate-180")} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass rounded-xl border border-white/10 overflow-hidden shadow-xl">
                    <div className="px-4 py-3 border-b border-white/8">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      <p className="text-xs text-white/40 truncate">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <DropdownItem icon={user.role === "admin" ? ShieldCheck : LayoutDashboard} to={primaryDashboardPath} onClick={() => setProfileOpen(false)}>
                        {user.role === "admin" ? "Admin Panel" : "Dashboard"}
                      </DropdownItem>
                      {(user.role !== "admin" || canAccessAdminOrders) && (
                        <DropdownItem icon={FileText} to={ordersPath} onClick={() => setProfileOpen(false)}>
                          {user.role === "admin" ? "Order Desk" : "My Orders"}
                        </DropdownItem>
                      )}
                      <DropdownItem icon={User} to="/dashboard/profile" onClick={() => setProfileOpen(false)}>Profile</DropdownItem>
                    </div>
                    <div className="p-1 border-t border-white/8">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                        <LogOut size={14} /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign in</Button>
              <Button size="sm" onClick={() => navigate("/register")}>Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-9 h-9 glass rounded-lg flex items-center justify-center text-white/70"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-white/8 px-4 py-4 flex flex-col gap-2">
          <MobileLink to="/services" onClick={() => setMobileOpen(false)}>Services</MobileLink>
          <MobileLink to="/pricing" onClick={() => setMobileOpen(false)}>Pricing</MobileLink>
          {user ? (
            <>
              <MobileLink to={primaryDashboardPath} onClick={() => setMobileOpen(false)}>
                {user.role === "admin" ? "Admin Panel" : "Dashboard"}
              </MobileLink>
              <button onClick={handleLogout} className="text-left px-3 py-2.5 text-sm text-red-400">Sign out</button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => { navigate("/login"); setMobileOpen(false) }}>Sign in</Button>
              <Button size="sm" className="flex-1" onClick={() => { navigate("/register"); setMobileOpen(false) }}>Get Started</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

function NavLink({ to, children, active }) {
  return (
    <Link to={to} className={cn("text-sm font-medium transition-colors", active ? "text-brand-400" : "text-white/60 hover:text-white")}>
      {children}
    </Link>
  )
}

function MobileLink({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
      {children}
    </Link>
  )
}

function DropdownItem({ icon: Icon, to, onClick, children }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { navigate(to); onClick?.() }}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Icon size={14} className="text-white/40" /> {children}
    </button>
  )
}
