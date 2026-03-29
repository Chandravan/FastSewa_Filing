import { useMemo, useState } from "react";
import { Mail, MapPin, MessageSquare, PhoneCall, Send } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP_NUMBER, formatWhatsappNumber } from "@/lib/support";
import { contactApi } from "@/lib/api";
import { notifyError, notifySuccess, notifyWarning } from "@/lib/toast";

function buildWhatsappSupportUrl() {
  const phone = SUPPORT_WHATSAPP_NUMBER || "";
  const url = new URL(`https://wa.me/${phone}`);
  url.searchParams.set("text", "Hi FastSewa team, I need help with a service inquiry.");
  return url.toString();
}

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const supportPhoneLabel = formatWhatsappNumber(SUPPORT_WHATSAPP_NUMBER);
  const whatsappUrl = useMemo(() => buildWhatsappSupportUrl(), []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      notifyWarning("Please fill name, email, and message.");
      return;
    }

    if (!trimmedEmail.includes("@")) {
      notifyWarning("Please enter a valid email address.");
      return;
    }

    if (trimmedMessage.length < 10) {
      notifyWarning("Message should be at least 10 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await contactApi.submit({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      notifySuccess(data.message || "Message sent successfully.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (requestError) {
      notifyError(requestError, "Unable to send message right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 md:p-10">
          <Badge
            variant="brand"
            className="px-3 py-1.5 text-[11px] uppercase tracking-[0.22em]"
          >
            Contact
          </Badge>
          <h1 className="mt-5 text-4xl font-display font-bold text-white md:text-6xl">
            Talk to the FastSewa team.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/52 md:text-lg">
            For service guidance, order support, or partnership discussions, reach out through email or WhatsApp.
          </p>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-2.5 text-white/70">
                <Mail size={16} />
              </div>
              <h2 className="mt-3 text-lg font-display font-bold text-white">Email Support</h2>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-2 inline-block text-sm text-brand-300 hover:text-brand-200 transition-colors"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-2.5 text-white/70">
                <PhoneCall size={16} />
              </div>
              <h2 className="mt-3 text-lg font-display font-bold text-white">WhatsApp</h2>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-brand-300 hover:text-brand-200 transition-colors"
              >
                {supportPhoneLabel || "Open chat"}
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="inline-flex rounded-xl border border-white/10 bg-black/20 p-2.5 text-white/70">
                <MapPin size={16} />
              </div>
              <h2 className="mt-3 text-lg font-display font-bold text-white">Office</h2>
              <p className="mt-2 text-sm text-white/55">Mumbai, Maharashtra, India</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7">
            <h2 className="text-2xl font-display font-bold text-white">Send a message</h2>
            <p className="mt-2 text-sm text-white/50">
              Fill details and send your message directly to our support team.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/40">Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-brand-500/50 focus:outline-none"
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/40">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:border-brand-500/50 focus:outline-none"
                  placeholder="you@company.com"
                  autoComplete="email"
                  disabled={submitting}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-white/40">Message</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-brand-500/50 focus:outline-none"
                  placeholder="Tell us what you need help with."
                  required
                  disabled={submitting}
                />
              </div>
              <Button type="submit" className="w-full gap-2" loading={submitting}>
                Send Message <Send size={16} />
              </Button>
            </form>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/80 transition-colors hover:border-brand-500/40 hover:text-white"
            >
              Chat on WhatsApp <MessageSquare size={15} />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
