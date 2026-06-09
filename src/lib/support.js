const DEFAULT_SUPPORT_EMAIL = "support@fastsewa.in"
const DEFAULT_SUPPORT_WHATSAPP_NUMBER = "919504341172"

export const BRAND_NAME = "FastSewa Filings"
export const LEGAL_ENTITY_NAME = "Fastsewa Filings Pvt. Ltd."
export const HEAD_OFFICE_ADDRESS = "At - Abirpur, Post Office - Hansi Kewal, P.S. - Bhagwanpur, Pincode - 844131, District - Vaishali, State - Bihar"
export const BUSINESS_HOURS = "09:00 AM - 09:00 PM"

function normalizeWhatsappNumber(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
}

export const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || DEFAULT_SUPPORT_EMAIL
export const SUPPORT_WHATSAPP_NUMBER = normalizeWhatsappNumber(
  import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER || DEFAULT_SUPPORT_WHATSAPP_NUMBER
)

export function formatWhatsappNumber(number = SUPPORT_WHATSAPP_NUMBER) {
  const digits = normalizeWhatsappNumber(number)
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
  }

  return digits ? `+${digits}` : ""
}

export function buildWhatsAppUrl({ orderNumber = "", serviceName = "", clientName = "" } = {}) {
  const number = normalizeWhatsappNumber(SUPPORT_WHATSAPP_NUMBER)
  const messageLines = [
    `Hi ${BRAND_NAME} team, I need help with my order.`,
    orderNumber ? `Order: ${orderNumber}` : "",
    serviceName ? `Service: ${serviceName}` : "",
    clientName ? `Client: ${clientName}` : "",
  ].filter(Boolean)

  const url = new URL(`https://wa.me/${number}`)
  url.searchParams.set("text", messageLines.join("\n"))
  return url.toString()
}
