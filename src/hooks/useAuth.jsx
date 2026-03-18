import { createContext, useContext, useState, useCallback } from "react"
import { MOCK_USER } from "@/data/mockData"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Mock: In production, load from JWT / localStorage
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    // TODO: Replace with real API call
    // const res = await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({email, password}) })
    await new Promise((r) => setTimeout(r, 1000)) // Simulate API delay
    setUser(MOCK_USER)
    localStorage.setItem("fastsewa_user", JSON.stringify(MOCK_USER))
    setLoading(false)
    return { success: true }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    // TODO: Replace with real API call
    await new Promise((r) => setTimeout(r, 1200))
    const newUser = { ...MOCK_USER, ...data, id: "usr-new" }
    setUser(newUser)
    localStorage.setItem("fastsewa_user", JSON.stringify(newUser))
    setLoading(false)
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem("fastsewa_user")
  }, [])

  // Auto-restore session on page load
  const restoreSession = useCallback(() => {
    const stored = localStorage.getItem("fastsewa_user")
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
