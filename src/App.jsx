import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "@/hooks/useAuth"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// Pages
import LandingPage from "@/pages/LandingPage"
import ServicesPage from "@/pages/ServicesPage"
import LoginPage from "@/pages/auth/LoginPage"
import RegisterPage from "@/pages/auth/RegisterPage"
import DashboardPage from "@/pages/client/DashboardPage"
import OrdersPage from "@/pages/client/OrdersPage"
import OrderDetailPage from "@/pages/client/OrderDetailPage"
import OrderPlacementPage from "@/pages/client/OrderPlacementPage"
import ProfilePage from "@/pages/client/ProfilePage"

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) {
    const stored = localStorage.getItem("fastsewa_user")
    if (!stored) return <Navigate to="/login" replace />
  }
  return children
}

// Pages that don't show footer
const NO_FOOTER_PATHS = ["/dashboard", "/login", "/register"]

function AppLayout() {
  const path = window.location.pathname
  const showFooter = !NO_FOOTER_PATHS.some((p) => path.startsWith(p))

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Order placement (requires login) */}
        <Route path="/order/:serviceId" element={
          <ProtectedRoute><OrderPlacementPage /></ProtectedRoute>
        } />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
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
      </AuthProvider>
    </BrowserRouter>
  )
}
