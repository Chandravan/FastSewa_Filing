import { useNavigate } from "react-router-dom"
import { ArrowRight, Shield, Clock, Headphones, Star, CheckCircle2, TrendingUp, Users, Award } from "lucide-react"
import { Button, Card, Badge } from "@/components/ui"
import { SERVICES } from "@/data/mockData"
import { formatCurrency } from "@/lib/utils"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <HeroSection navigate={navigate} />
      <StatsSection />
      <ServicesPreview navigate={navigate} />
      <WhyUsSection />
      <HowItWorks />
      <CtaSection navigate={navigate} />
    </div>
  )
}

function HeroSection({ navigate }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden grid-bg">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-brand-500/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 text-center">
        <Badge variant="brand" className="mb-6 animate-fade-up">
          🇮🇳 India's Fastest Compliance Platform
        </Badge>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-white leading-[1.08] mb-6 animate-fade-up animate-delay-100">
          GST. ITR. ROC.<br />
          <span className="text-gradient">Done Right.</span>
        </h1>

        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200">
          FastSewa handles your compliance filings end-to-end — quick turnaround, expert CAs, transparent pricing.
          No chaos, no missed deadlines.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up animate-delay-300">
          <Button size="lg" onClick={() => navigate("/services")} className="gap-2">
            Explore Services <ArrowRight size={18} />
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate("/register")}>
            Create Free Account
          </Button>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/35 animate-fade-up animate-delay-400">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> 10,000+ Filings Done</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> CA-Verified Work</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> 100% Online</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-400" /> Secure & Confidential</span>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const stats = [
    { label: "Filings Completed", value: "10,000+", icon: TrendingUp },
    { label: "Happy Clients", value: "3,200+", icon: Users },
    { label: "Avg. Turnaround", value: "48 hrs", icon: Clock },
    { label: "Years Experience", value: "8+", icon: Award },
  ]

  return (
    <section className="py-16 border-y border-white/6">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={18} className="text-brand-400" />
              </div>
              <div className="text-3xl font-display font-bold text-white mb-1">{value}</div>
              <div className="text-sm text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ServicesPreview({ navigate }) {
  const featured = SERVICES.filter((s) => s.popular).slice(0, 4)

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <Badge variant="brand" className="mb-3">Popular Services</Badge>
            <h2 className="text-4xl font-display font-bold text-white">What We Do Best</h2>
            <p className="text-white/45 mt-2">Fast, affordable, expert-handled.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate("/services")} className="hidden sm:flex items-center gap-1.5">
            View All <ArrowRight size={14} />
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((service, i) => (
            <ServiceCard key={service.id} service={service} delay={i * 100} navigate={navigate} />
          ))}
        </div>

        <div className="mt-6 sm:hidden text-center">
          <Button variant="outline" onClick={() => navigate("/services")} className="w-full">View All Services</Button>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ service, delay, navigate }) {
  const categoryColors = {
    GST: "bg-orange-500/10 text-orange-400",
    ITR: "bg-blue-500/10 text-blue-400",
    Company: "bg-purple-500/10 text-purple-400",
    TDS: "bg-yellow-500/10 text-yellow-400",
    MSME: "bg-green-500/10 text-green-400",
  }

  return (
    <Card
      hover
      className={`animate-fade-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
      onClick={() => navigate(`/services/${service.id}`)}
    >
      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium mb-3 ${categoryColors[service.category] || "bg-white/10 text-white/50"}`}>
        {service.category}
      </span>
      <h3 className="font-display font-semibold text-white text-sm mb-2 leading-snug">{service.name}</h3>
      <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{service.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-brand-400 font-bold font-mono">{formatCurrency(service.price)}</span>
        <span className="text-xs text-white/30">{service.duration}</span>
      </div>
    </Card>
  )
}

function WhyUsSection() {
  const reasons = [
    { icon: Shield, title: "Secure & Confidential", desc: "Your financial data is encrypted and never shared. CA-supervised processing." },
    { icon: Clock, title: "Fast Turnaround", desc: "Most filings completed within 24–48 hours. Real-time status updates." },
    { icon: Headphones, title: "Expert Support", desc: "Dedicated CAs and support team reachable via WhatsApp, email, or call." },
    { icon: Star, title: "Transparent Pricing", desc: "Flat fees, no hidden charges. Know exactly what you pay before ordering." },
  ]

  return (
    <section className="py-24 border-t border-white/6">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">Why FastSewa</Badge>
          <h2 className="text-4xl font-display font-bold text-white mb-3">Compliance Without the Headache</h2>
          <p className="text-white/45 max-w-lg mx-auto">We handle the complexity so you can focus on running your business.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="glass rounded-xl p-6 text-center group hover:border-brand-500/20 transition-all" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-500/15 transition-colors">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Pick a Service", desc: "Browse our catalog and select the filing you need." },
    { n: "02", title: "Pay Securely", desc: "Pay online via Razorpay. GST invoice issued instantly." },
    { n: "03", title: "Upload Documents", desc: "Upload required docs directly in your dashboard." },
    { n: "04", title: "We File for You", desc: "Our CA team processes and files. You track live status." },
  ]

  return (
    <section className="py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">Process</Badge>
          <h2 className="text-4xl font-display font-bold text-white">How It Works</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map(({ n, title, desc }, i) => (
            <div key={n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px border-t border-dashed border-white/10 -translate-x-4 z-0" />
              )}
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl glass border border-white/10 flex items-center justify-center mb-4">
                  <span className="font-mono text-brand-400 text-sm font-bold">{n}</span>
                </div>
                <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CtaSection({ navigate }) {
  return (
    <section className="py-24 border-t border-white/6">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-500/8 to-transparent pointer-events-none" />
          <Badge variant="brand" className="mb-5 relative">Limited Time Offer</Badge>
          <h2 className="text-4xl font-display font-bold text-white mb-4 relative">
            First Filing at <span className="text-gradient">50% Off</span>
          </h2>
          <p className="text-white/45 mb-8 relative max-w-md mx-auto">
            New clients get their first service at half price. No coupon needed — discount applied automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Button size="lg" onClick={() => navigate("/register")}>
              Start Now — It's Free <ArrowRight size={18} />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
