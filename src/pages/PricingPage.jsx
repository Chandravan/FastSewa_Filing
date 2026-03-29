import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { servicesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const planCards = [
  {
    title: "Starter",
    price: "Pay per service",
    points: [
      "Best for one-time compliance tasks",
      "Clear upfront pricing before checkout",
      "Order-level status tracking",
    ],
  },
  {
    title: "Growth",
    price: "Custom bundle",
    points: [
      "For businesses with recurring filings",
      "Combined planning across multiple services",
      "Priority coordination support",
    ],
  },
  {
    title: "Enterprise",
    price: "Quote on request",
    points: [
      "For higher volume compliance workflows",
      "Dedicated handling and operational alignment",
      "Customized process and reporting",
    ],
  },
];

export default function PricingPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      setLoading(true);
      try {
        const data = await servicesApi.list();
        if (!active) return;
        setServices(data.items || []);
        setError("");
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || "Unable to load pricing.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadServices();

    return () => {
      active = false;
    };
  }, []);

  const featuredPrices = useMemo(() => {
    return [...services]
      .sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0))
      .slice(0, 9);
  }, [services]);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
          <Badge
            variant="brand"
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
          >
            Pricing
          </Badge>
          <h1 className="mt-5 text-4xl font-display font-bold text-white md:text-6xl">
            Transparent pricing, no surprises.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/52 md:text-lg">
            FastSewa follows a straightforward service-based pricing model. You can start with
            individual services and scale to bundled support as your compliance needs grow.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {planCards.map((plan) => (
            <article
              key={plan.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-brand-300">{plan.title}</p>
              <h2 className="mt-2 text-2xl font-display font-bold text-white">{plan.price}</h2>
              <div className="mt-5 space-y-3">
                {plan.points.map((point) => (
                  <div key={point} className="flex items-start gap-2.5 text-sm text-white/50">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-400/80" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-7 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge variant="brand" className="inline-flex gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
                <Sparkles size={14} />
                Service Price Snapshot
              </Badge>
              <h2 className="mt-4 text-2xl font-display font-bold text-white md:text-3xl">
                Popular entry pricing
              </h2>
              <p className="mt-2 text-sm text-white/50">
                Live from your current service catalog.
              </p>
            </div>
            <Link to="/services">
              <Button variant="outline" className="gap-2">
                View Full Catalog <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/45">
              Loading service pricing...
            </div>
          )}

          {!loading && error && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/8 p-5 text-sm text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPrices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-white/35">{service.category}</p>
                  <p className="mt-2 text-sm font-medium text-white/80">{service.name}</p>
                  <p className="mt-3 text-lg font-display font-bold text-brand-300">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
