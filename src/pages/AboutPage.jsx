import { Link } from "react-router-dom";
import { Award, BadgeCheck, Building2, Clock3, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust First",
    description:
      "Sensitive business and tax information is handled with strict confidentiality and process discipline.",
  },
  {
    icon: Clock3,
    title: "Fast Turnaround",
    description:
      "We keep filing cycles efficient with clear timelines, practical checklists, and proactive follow-ups.",
  },
  {
    icon: BadgeCheck,
    title: "Quality Execution",
    description:
      "Every order follows a structured internal workflow so quality does not depend on guesswork.",
  },
];

const milestones = [
  { label: "Orders Processed", value: "10,000+" },
  { label: "Client Segments", value: "MSME, Startup, Individual" },
  { label: "Core Focus", value: "Tax + Compliance + Filings" },
];

const pillars = [
  {
    icon: Building2,
    title: "Business Compliance Stack",
    text: "GST, ROC, ITR and statutory workflows under one platform experience.",
  },
  {
    icon: Users,
    title: "Human + Platform Model",
    text: "Structured software workflow backed by accountable human support.",
  },
  {
    icon: Award,
    title: "Operational Accountability",
    text: "Order-level status tracking and clear ownership from intake to completion.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
          <Badge
            variant="brand"
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
          >
            About FastSewa
          </Badge>
          <h1 className="mt-5 text-4xl font-display font-bold text-white md:text-6xl">
            Built for reliable compliance execution.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/52 md:text-lg">
            FastSewa helps businesses and individuals handle filings with less friction.
            Our approach blends a structured platform flow with practical support so
            compliance work stays clear, trackable, and on time.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {milestones.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">{item.label}</p>
                <p className="mt-3 text-2xl font-display font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-6">
            <Badge variant="brand" className="inline-flex gap-2 px-3 py-1.5 text-[11px] uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              What We Stand For
            </Badge>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <div className="inline-flex rounded-xl border border-brand-500/25 bg-brand-500/10 p-2.5 text-brand-300">
                  <Icon size={18} />
                </div>
                <h2 className="mt-4 text-xl font-display font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/52">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-7 md:p-8">
          <h2 className="text-2xl font-display font-bold text-white md:text-3xl">
            Platform Pillars
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-2.5 text-white/70">
                  <Icon size={16} />
                </div>
                <h3 className="mt-3 text-lg font-display font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
          <h2 className="text-xl font-display font-bold text-white">Need a filing partner?</h2>
          <p className="mt-2 text-sm leading-relaxed text-white/50">
            Start with the service catalog and place your order in a few steps.
          </p>
          <div className="mt-5">
            <Link to="/services">
              <Button>Explore Services</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
