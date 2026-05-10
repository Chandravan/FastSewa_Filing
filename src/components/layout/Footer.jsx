import { Link } from "react-router-dom"
import { Mail, Phone, MapPin } from "lucide-react"
import {
  BRAND_NAME,
  HEAD_OFFICE_ADDRESS,
  LEGAL_ENTITY_NAME,
  formatWhatsappNumber,
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_NUMBER,
} from "@/lib/support"

const LINKS = {
  Services: ["GST Registration", "GST Return Filing", "ITR Filing", "Company Registration", "ROC Filing", "TDS Return"],
  Company: ["About Us", "Our Team", "Pricing", "Contact Us"],
  Legal: ["Privacy Policy", "Terms & Conditions", "Refund & Cancellation"],
}

const LINK_ROUTES = {
  "About Us": "/about",
  "Our Team": "/team",
  "Pricing": "/pricing",
  "Contact Us": "/contact-us",
  "Privacy Policy": "/privacy-policy",
  "Terms & Conditions": "/terms-and-conditions",
  "Refund & Cancellation": "/refund-cancellation-policy",
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const supportPhoneLabel = formatWhatsappNumber(SUPPORT_WHATSAPP_NUMBER)
  const supportPhoneHref = SUPPORT_WHATSAPP_NUMBER ? `tel:+${SUPPORT_WHATSAPP_NUMBER}` : null

  return (
    <footer className="border-t border-white/8 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">F</span>
              </div>
              <span className="font-display font-bold text-white text-lg">
                {BRAND_NAME}
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
              India's trusted compliance partner. GST, ITR, ROC filings made simple, fast, and affordable.
            </p>
            <div className="flex flex-col gap-3">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-brand-400 transition-colors">
                <Mail size={14} /> {SUPPORT_EMAIL}
              </a>
              {supportPhoneHref && (
                <a href={supportPhoneHref} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-brand-400 transition-colors">
                  <Phone size={14} /> {supportPhoneLabel}
                </a>
              )}
              <div className="space-y-1.5 text-sm text-white/40">
                <span className="flex items-start gap-2.5">
                  <MapPin size={14} className="mt-0.5 shrink-0" />
                  <span>Head Office: {HEAD_OFFICE_ADDRESS}</span>
                </span>
              </div>
            </div>
          </div>

          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white/70 mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => {
                  const route = LINK_ROUTES[link] || (category === "Services" ? `/services?search=${encodeURIComponent(link)}` : null)
                  return (
                    <li key={link}>
                      {route ? (
                        <Link to={route} className="text-sm text-white/35 hover:text-white/70 transition-colors">
                          {link}
                        </Link>
                      ) : (
                        <span className="text-sm text-white/35">
                          {link}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">{BRAND_NAME} is operated by {LEGAL_ENTITY_NAME}.</p>
          <p className="text-xs text-white/20">Head Office | Patna, Bihar 800007</p>
        </div>
      </div>
    </footer>
  )
}
