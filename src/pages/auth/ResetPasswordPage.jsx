import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { authApi, storeAuthSession } from "@/lib/api"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/toast"

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetToken = useMemo(() => searchParams.get("token") || "", [searchParams])
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!resetToken) {
      notifyError("This reset link is missing or invalid.")
      return
    }

    if (form.password.length < 8) {
      notifyWarning("Password must be at least 8 characters long.")
      return
    }

    if (form.password !== form.confirmPassword) {
      notifyWarning("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const data = await authApi.resetPassword({
        token: resetToken,
        password: form.password,
      })
      storeAuthSession(data)
      notifySuccess(data.message || "Password reset successfully.")
      navigate("/dashboard", { replace: true })
    } catch (requestError) {
      notifyError(requestError, "Unable to reset your password right now.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">F</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Fast<span className="text-gradient">Sewa</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Set a new password</h1>
          <p className="text-white/45">Choose a strong password for your FastSewa account.</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">New password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Input
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter new password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
            />

            <Button type="submit" className="w-full gap-2" size="lg" loading={loading}>
              Reset Password <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Back to{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
