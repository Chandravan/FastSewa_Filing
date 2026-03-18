import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { User, Mail, Phone, Building2, MapPin, Shield, Edit3, Save, X, CreditCard } from "lucide-react"
import { Button, Input } from "@/components/ui"
import { useAuth } from "@/hooks/useAuth"
import { getInitials, formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    pan: user?.pan || "",
    gstin: user?.gstin || "",
    address: user?.address || "",
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => navigate("/login")}>Sign In</Button>
      </div>
    )
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    setSaving(false)
    setEditing(false)
  }

  return (
    <div className="min-h-screen pt-24 pb-20 md:pl-64">
      <div className="max-w-3xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">My Profile</h1>
            <p className="text-white/40 mt-1">Member since {formatDate(user.joinedAt)}</p>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Edit3 size={14} /> Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="gap-1.5">
                <X size={14} /> Cancel
              </Button>
              <Button size="sm" loading={saving} onClick={handleSave} className="gap-1.5">
                <Save size={14} /> Save
              </Button>
            </div>
          )}
        </div>

        {/* Avatar section */}
        <div className="glass rounded-2xl p-6 mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center shrink-0">
            <span className="text-brand-400 font-display font-bold text-xl">
              {getInitials(user.name)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">{user.name}</h2>
            <p className="text-white/40 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Personal Info */}
        <Section title="Personal Information" icon={User}>
          <div className="grid sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <Input label="Full Name" value={form.name} onChange={set("name")} icon={User} />
                <Input label="Mobile Number" value={form.phone} onChange={set("phone")} icon={Phone} />
              </>
            ) : (
              <>
                <InfoField icon={User} label="Full Name" value={user.name} />
                <InfoField icon={Phone} label="Mobile" value={user.phone} />
                <InfoField icon={Mail} label="Email" value={user.email} />
              </>
            )}
          </div>
        </Section>

        {/* Business Info */}
        <Section title="Business Details" icon={Building2}>
          <div className="grid sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <Input label="Business / Company Name" value={form.businessName} onChange={set("businessName")} icon={Building2} />
                <Input label="PAN Number" value={form.pan} onChange={set("pan")} icon={CreditCard} placeholder="ABCDE1234F" />
                <Input label="GSTIN (if registered)" value={form.gstin} onChange={set("gstin")} icon={Shield} placeholder="27ABCDE1234F1ZX" />
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-white/70 block mb-1.5">Address</label>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={set("address")}
                    className="w-full rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 px-4 py-2.5 text-sm focus:outline-none focus:border-brand-500/50 transition-all resize-none"
                  />
                </div>
              </>
            ) : (
              <>
                <InfoField icon={Building2} label="Business Name" value={user.businessName} />
                <InfoField icon={CreditCard} label="PAN" value={user.pan} mono />
                <InfoField icon={Shield} label="GSTIN" value={user.gstin} mono />
                <InfoField icon={MapPin} label="Address" value={user.address} />
              </>
            )}
          </div>
        </Section>

        {/* Security */}
        <Section title="Security" icon={Shield}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/70">Password</p>
              <p className="text-xs text-white/35 mt-0.5">Last changed 3 months ago</p>
            </div>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="glass rounded-2xl p-6 mb-5">
      <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-5 flex items-center gap-2">
        <Icon size={14} className="text-brand-400" /> {title}
      </h3>
      {children}
    </div>
  )
}

function InfoField({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-white/20 shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-white/30 mb-0.5">{label}</p>
        <p className={`text-sm text-white/70 ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
      </div>
    </div>
  )
}
