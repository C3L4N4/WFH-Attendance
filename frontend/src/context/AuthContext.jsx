import { useEffect, useState } from 'react'
import { AuthContext } from './auth-context'
import { apiRequest } from '../services/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem('access_token')

      if (!token) {
        setInitializing(false)
        return
      }

      try {
        const currentUser = await apiRequest('/auth/me')
        localStorage.setItem('user', JSON.stringify(currentUser))
        setUser(currentUser)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        setInitializing(false)
      }
    }

    validateSession()
  }, [])

  async function login(email, password) {
    setLoading(true)

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setUser(data.user)

      return data.user
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, initializing, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}