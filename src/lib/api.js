const DEFAULT_API_BASE_URL = "https://fastsewa-backend.onrender.com/api"
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "")

const STORAGE_KEYS = {
  token: "fastsewa_token",
  user: "fastsewa_user",
}

function buildUrl(path, query) {
  const url = new URL(`${API_BASE_URL}${path}`)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value)
      }
    })
  }

  return url.toString()
}

function parseStoredUser(value) {
  if (!value) return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function getStoredToken() {
  return localStorage.getItem(STORAGE_KEYS.token)
}

export function getStoredUser() {
  return parseStoredUser(localStorage.getItem(STORAGE_KEYS.user))
}

export function storeAuthSession({ token, user }) {
  localStorage.setItem(STORAGE_KEYS.token, token)
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function updateStoredUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    query,
    headers = {},
    auth = false,
  } = options

  const token = auth ? getStoredToken() : null
  const requestHeaders = { ...headers }
  const requestOptions = {
    method,
    headers: requestHeaders,
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json"
    requestOptions.body = JSON.stringify(body)
  }

  const response = await fetch(buildUrl(path, query), requestOptions)
  const contentType = response.headers.get("content-type") || ""
  const responseData = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const error = new Error(responseData?.message || "Request failed")
    error.status = response.status
    error.details = responseData?.details || null
    throw error
  }

  return responseData
}

export function submitHostedPayment(payment) {
  if (!payment?.actionUrl || !payment?.fields) {
    throw new Error("Hosted payment details are incomplete")
  }

  const form = document.createElement("form")
  form.method = payment.method || "POST"
  form.action = payment.actionUrl
  form.style.display = "none"

  Object.entries(payment.fields).forEach(([name, value]) => {
    const input = document.createElement("input")
    input.type = "hidden"
    input.name = name
    input.value = String(value)
    form.appendChild(input)
  })

  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

export const authApi = {
  login(payload) {
    return apiRequest("/auth/login", { method: "POST", body: payload })
  },
  register(payload) {
    return apiRequest("/auth/register", { method: "POST", body: payload })
  },
  forgotPassword(payload) {
    return apiRequest("/auth/forgot-password", { method: "POST", body: payload })
  },
  resetPassword(payload) {
    return apiRequest("/auth/reset-password", { method: "POST", body: payload })
  },
  changePassword(payload) {
    return apiRequest("/auth/change-password", { method: "POST", body: payload, auth: true })
  },
  me() {
    return apiRequest("/auth/me", { auth: true })
  },
}

export const servicesApi = {
  list(query) {
    return apiRequest("/services", { query })
  },
  get(serviceId) {
    return apiRequest(`/services/${serviceId}`)
  },
  adminCatalog(query) {
    return apiRequest("/services/admin/catalog", { query, auth: true })
  },
  create(payload) {
    return apiRequest("/services", { method: "POST", body: payload, auth: true })
  },
  update(serviceId, payload) {
    return apiRequest(`/services/${serviceId}`, { method: "PUT", body: payload, auth: true })
  },
  archive(serviceId) {
    return apiRequest(`/services/${serviceId}`, { method: "DELETE", auth: true })
  },
  restore(serviceId) {
    return apiRequest(`/services/${serviceId}/restore`, { method: "POST", auth: true })
  },
  bulkAction(payload) {
    return apiRequest("/services/bulk", { method: "POST", body: payload, auth: true })
  },
}

export const contactApi = {
  submit(payload) {
    return apiRequest("/contact", { method: "POST", body: payload })
  },
  listInquiries(query) {
    return apiRequest("/contact/admin/inquiries", { query, auth: true })
  },
  updateInquiry(inquiryId, payload) {
    return apiRequest(`/contact/admin/inquiries/${inquiryId}`, { method: "PUT", body: payload, auth: true })
  },
}

export const dashboardApi = {
  getOverview() {
    return apiRequest("/dashboard/overview", { auth: true })
  },
  getAdminOverview() {
    return apiRequest("/dashboard/admin-overview", { auth: true })
  },
}

export const ordersApi = {
  list(query) {
    return apiRequest("/orders", { auth: true, query })
  },
  get(orderId) {
    return apiRequest(`/orders/${orderId}`, { auth: true })
  },
  create(payload) {
    return apiRequest("/orders", { method: "POST", body: payload, auth: true })
  },
  addDocument(orderId, payload) {
    return apiRequest(`/orders/${orderId}/documents`, { method: "POST", body: payload, auth: true })
  },
  initiateCcavenue(orderId) {
    return apiRequest(`/orders/${orderId}/payments/ccavenue/initiate`, { method: "POST", auth: true })
  },
  adminUpdate(orderId, payload) {
    return apiRequest(`/orders/${orderId}/admin`, { method: "PUT", body: payload, auth: true })
  },
  bulkAdminUpdate(payload) {
    return apiRequest("/orders/bulk/admin", { method: "POST", body: payload, auth: true })
  },
}

export const usersApi = {
  list(query) {
    return apiRequest("/users", { auth: true, query })
  },
  create(payload) {
    return apiRequest("/users", { method: "POST", body: payload, auth: true })
  },
  getProfile() {
    return apiRequest("/users/profile", { auth: true })
  },
  updateProfile(payload) {
    return apiRequest("/users/profile", { method: "PUT", body: payload, auth: true })
  },
  adminUpdate(userId, payload) {
    return apiRequest(`/users/${userId}`, { method: "PUT", body: payload, auth: true })
  },
  setStatus(userId, payload) {
    return apiRequest(`/users/${userId}/status`, { method: "PUT", body: payload, auth: true })
  },
  remove(userId) {
    return apiRequest(`/users/${userId}`, { method: "DELETE", auth: true })
  },
  bulkAction(payload) {
    return apiRequest("/users/bulk", { method: "POST", body: payload, auth: true })
  },
}

export const auditApi = {
  list(query) {
    return apiRequest("/audit-logs", { query, auth: true })
  },
}
