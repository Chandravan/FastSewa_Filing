import { Badge } from "@/components/ui";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_NUMBER, formatWhatsappNumber } from "@/lib/support";

export function LegalSection({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
      <h2 className="text-xl font-display font-bold text-white md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/55 md:text-base">
        {children}
      </div>
    </section>
  );
}

export default function LegalPageLayout({
  label,
  title,
  summary,
  lastUpdated,
  children,
}) {
  const supportPhone = formatWhatsappNumber(SUPPORT_WHATSAPP_NUMBER);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
          <Badge
            variant="brand"
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
          >
            {label}
          </Badge>
          <h1 className="mt-5 text-4xl font-display font-bold text-white md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/52 md:text-lg">
            {summary}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/35">
            Last updated: {lastUpdated}
          </p>
        </div>

        <div className="mt-8 space-y-5">{children}</div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/50">
          <p>
            For policy questions, contact us at{" "}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-brand-300 hover:text-brand-200 transition-colors"
            >
              {SUPPORT_EMAIL}
            </a>
            {supportPhone ? ` or WhatsApp ${supportPhone}.` : "."}
          </p>
        </div>
      </div>
    </div>
  );
}
