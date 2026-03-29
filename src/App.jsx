import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// Pages
import LandingPage from "@/pages/LandingPage"
import ServicesPage from "@/pages/ServicesPage"
import AboutPage from "@/pages/AboutPage"
import PricingPage from "@/pages/PricingPage"
import ContactPage from "@/pages/ContactPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage"
import AdminAuditPage from "@/pages/admin/AdminAuditPage"
import AdminContactInquiriesPage from "@/pages/admin/AdminContactInquiriesPage"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import AdminOrdersPage from "@/pages/admin/AdminOrdersPage"
import AdminServicesPage from "@/pages/admin/AdminServicesPage"
import AdminUsersPage from "@/pages/admin/AdminUsersPage"
import DashboardPage from "@/pages/client/DashboardPage"
import OrdersPage from "@/pages/client/OrdersPage"
import OrderDetailPage from "@/pages/client/OrderDetailPage"
import OrderPlacementPage from "@/pages/client/OrderPlacementPage"
import ProfilePage from "@/pages/client/ProfilePage"
import TeamPage from "@/pages/TeamPage"
import PrivacyPolicyPage from "@/pages/legal/PrivacyPolicyPage"
import TermsOfServicePage from "@/pages/legal/TermsOfServicePage"
import RefundPolicyPage from "@/pages/legal/RefundPolicyPage"
import { getPrimaryAdminRoute, hasAnyPermission } from "@/lib/adminPermissions"
import { AppToastContainer } from "@/lib/toast"

// Protected route wrapper
function ProtectedRoute({ children, roles, permissions }) {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <p className="text-sm text-white/45">Loading your session...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === "admin" ? getPrimaryAdminRoute(user) : "/dashboard"} replace />
  }

  if (permissions && user.role === "admin" && !hasAnyPermission(user, permissions)) {
    return <Navigate to={getPrimaryAdminRoute(user)} replace />
  }

  return children
}

function DashboardHomeRoute() {
  const { user } = useAuth()

  if (user?.role === "admin") {
    return <Navigate to={getPrimaryAdminRoute(user)} replace />
  }

  return <DashboardPage />
}

// Pages that don't show footer
const NO_FOOTER_PATHS = ["/dashboard", "/admin", "/login", "/register", "/forgot-password", "/reset-password"]

function AppLayout() {
  const location = useLocation()
  const showFooter = !NO_FOOTER_PATHS.some((p) => location.pathname.startsWith(p))

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Order placement (requires login) */}
        <Route path="/order/:serviceId" element={
          <ProtectedRoute><OrderPlacementPage /></ProtectedRoute>
        } />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardHomeRoute /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute roles={["admin"]} permissions={["dashboard.view"]}><AdminDashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute roles={["admin"]} permissions={["orders.view", "orders.manage", "orders.bulk"]}><AdminOrdersPage /></ProtectedRoute>
        } />
        <Route path="/admin/services" element={
          <ProtectedRoute roles={["admin"]} permissions={["services.view", "services.manage", "services.archive", "services.restore", "services.bulk"]}><AdminServicesPage /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={["admin"]} permissions={["users.view", "users.manage", "users.disable", "users.delete", "users.bulk"]}><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="/admin/audit" element={
          <ProtectedRoute roles={["admin"]} permissions={["audit.view"]}><AdminAuditPage /></ProtectedRoute>
        } />
        <Route path="/admin/inquiries" element={
          <ProtectedRoute roles={["admin"]} permissions={["inquiries.view", "inquiries.manage"]}><AdminContactInquiriesPage /></ProtectedRoute>
        } />
        <Route path="/dashboard/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/dashboard/orders/:orderId" element={
          <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
        } />
        <Route path="/dashboard/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
        <AppToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
