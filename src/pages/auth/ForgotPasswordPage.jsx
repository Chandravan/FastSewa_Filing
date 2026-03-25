import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Mail } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { authApi } from "@/lib/api"
import { notifyError, notifySuccess, notifyWarning } from "@/lib/toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [previewResetUrl, setPreviewResetUrl] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim()) {
      notifyWarning("Enter your email address to receive a reset link.")
      return
    }

    setLoading(true)
    setPreviewResetUrl("")

    try {
      const data = await authApi.forgotPassword({ email })
      notifySuccess(data.message || "Reset instructions sent.")
      setPreviewResetUrl(data.previewResetUrl || "")
    } catch (requestError) {
      notifyError(requestError, "Unable to send reset instructions right now.")
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
          <h1 className="text-3xl font-display font-bold text-white mb-2">Forgot your password?</h1>
          <p className="text-white/45">Enter your email and we will send you a reset link.</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              icon={Mail}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            {previewResetUrl && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-sm text-green-300">
                <p>Dev preview link:</p>
                <p className="mt-2 text-xs text-green-200/80 break-all">
                  <a href={previewResetUrl} className="underline">{previewResetUrl}</a>
                </p>
              </div>
            )}

            <Button type="submit" className="w-full gap-2" size="lg" loading={loading}>
              Send Reset Link <ArrowRight size={16} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Remembered it?{" "}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
