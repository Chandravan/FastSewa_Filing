import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowRight, Clock, FileText, CheckCircle } from "lucide-react"
import { Button, Badge, Card } from "@/components/ui"
import { SERVICES, SERVICE_CATEGORIES } from "@/data/mockData"
import { formatCurrency, cn } from "@/lib/utils"

export default function ServicesPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch] = useState("")

  const filtered = SERVICES.filter((s) => {
    const matchCat = activeCategory === "All" || s.category === activeCategory
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-4">All Services</Badge>
          <h1 className="text-5xl font-display font-bold text-white mb-4">Compliance Services</h1>
          <p className="text-white/45 max-w-lg mx-auto">
            Expert-handled filings for GST, income tax, company registration, and more. Flat pricing, no surprises.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-brand-500/50 transition-all"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  activeCategory === cat
                    ? "bg-brand-500 text-white"
                    : "glass text-white/50 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <FileText size={40} className="mx-auto mb-3 opacity-50" />
            <p>No services found for "{search}"</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service) => (
              <ServiceDetailCard key={service.id} service={service} navigate={navigate} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceDetailCard({ service, navigate }) {
  const categoryColors = {
    GST: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    ITR: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Company: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    TDS: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    MSME: "bg-green-500/10 text-green-400 border-green-500/20",
  }

  return (
    <div className="glass rounded-xl p-6 flex flex-col gap-4 glass-hover group">
      <div className="flex items-start justify-between">
        <span className={cn("inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border", categoryColors[service.category] || "bg-white/10 text-white/50 border-white/10")}>
          {service.category}
        </span>
        {service.popular && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 border border-brand-500/20 font-medium">
            Popular
          </span>
        )}
      </div>

      <div>
        <h3 className="font-display font-bold text-white text-base mb-2 group-hover:text-brand-300 transition-colors">
          {service.name}
        </h3>
        <p className="text-sm text-white/40 leading-relaxed">{service.description}</p>
      </div>

      {/* Documents needed */}
      <div>
        <p className="text-xs text-white/30 mb-2 font-medium uppercase tracking-wider">Documents needed</p>
        <div className="flex flex-col gap-1">
          {service.documents.slice(0, 3).map((doc) => (
            <span key={doc} className="flex items-center gap-1.5 text-xs text-white/40">
              <CheckCircle size={11} className="text-green-400/70 shrink-0" /> {doc}
            </span>
          ))}
          {service.documents.length > 3 && (
            <span className="text-xs text-white/25">+{service.documents.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/8 mt-auto">
        <div>
          <div className="text-xl font-bold font-mono text-brand-400">{formatCurrency(service.price)}</div>
          <div className="flex items-center gap-1 text-xs text-white/30 mt-0.5">
            <Clock size={11} /> {service.duration}
          </div>
        </div>
        <Button size="sm" className="gap-1" onClick={() => navigate(`/order/${service.id}`)}>
          Order <ArrowRight size={13} />
        </Button>
      </div>
    </div>
  )
}
