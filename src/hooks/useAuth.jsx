import { createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  authApi,
  clearAuthSession,
  getStoredToken,
  getStoredUser,
  storeAuthSession,
  updateStoredUser,
} from "@/lib/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      storeAuthSession(data)
      setUser(data.user)
      return { success: true, user: data.user }
    } catch (error) {
      clearAuthSession()
      setUser(null)
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (data) => {
    setLoading(true)
    try {
      const response = await authApi.register(data)
      storeAuthSession(response)
      setUser(response.user)
      return { success: true, user: response.user }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const changePassword = useCallback(async (payload) => {
    setLoading(true)
    try {
      const response = await authApi.changePassword(payload)
      storeAuthSession(response)
      setUser(response.user)
      return { success: true, user: response.user, message: response.message }
    } catch (error) {
      return { success: false, message: error.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearAuthSession()
  }, [])

  const restoreSession = useCallback(async () => {
    const token = getStoredToken()
    const storedUser = getStoredUser()

    if (!token) {
      setUser(null)
      setInitialized(true)
      return
    }

    if (storedUser) {
      setUser(storedUser)
    }

    try {
      const data = await authApi.me()
      setUser(data.user)
      updateStoredUser(data.user)
    } catch {
      clearAuthSession()
      setUser(null)
    } finally {
      setInitialized(true)
    }
  }, [])

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser)
    updateStoredUser(nextUser)
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  return (
    <AuthContext.Provider value={{ user, loading, initialized, login, register, changePassword, logout, restoreSession, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside AuthProvider")
  return ctx
}
