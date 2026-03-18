import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }
    const result = await login(form.email, form.password)
    if (result.success) navigate("/dashboard")
    else setError("Invalid credentials. Please try again.")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">F</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Fast<span className="text-gradient">Sewa</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/45">Sign in to your FastSewa account</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/70">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" loading={loading}>
              Sign In <ArrowRight size={16} />
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 px-3 py-2.5 rounded-lg bg-blue-500/5 border border-blue-500/15">
            <p className="text-xs text-blue-400/80">
              <strong className="text-blue-400">Demo:</strong> Enter any email + password to login with mock data.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
