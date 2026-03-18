import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Mail, Lock, User, Phone, Building2, ArrowRight, Eye, EyeOff } from "lucide-react"
import { Button, Input, Divider } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"

export default function RegisterPage() {
  const { register, loading } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "", email: "", phone: "", businessName: "", password: "", confirmPassword: "",
  })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.email.includes("@")) errs.email = "Valid email required"
    if (!/^[6-9]\d{9}$/.test(form.phone)) errs.phone = "Valid 10-digit mobile number required"
    if (form.password.length < 8) errs.password = "Minimum 8 characters"
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match"
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    const result = await register(form)
    if (result.success) navigate("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24 grid-bg">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full bg-brand-500/6 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">F</span>
            </div>
            <span className="font-display font-bold text-white text-lg">Fast<span className="text-gradient">Sewa</span></span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Create your account</h1>
          <p className="text-white/45">Start managing your compliance today</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" placeholder="Arjun Mehta" icon={User} value={form.name} onChange={set("name")} error={errors.name} />
              <Input label="Mobile Number" placeholder="9876543210" icon={Phone} value={form.phone} onChange={set("phone")} error={errors.phone} />
            </div>

            <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={set("email")} error={errors.email} />

            <Input label="Business / Company Name (Optional)" placeholder="Mehta Enterprises" icon={Building2} value={form.businessName} onChange={set("businessName")} />

            <Divider label="Set Password" />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-white/70">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><Lock size={16} /></span>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={set("password")}
                  className="w-full rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/25 pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              icon={Lock}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              error={errors.confirmPassword}
            />

            <Button type="submit" className="w-full gap-2 mt-2" size="lg" loading={loading}>
              Create Account <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-xs text-white/25 text-center mt-4 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-white/40 hover:text-white/70">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="text-white/40 hover:text-white/70">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
