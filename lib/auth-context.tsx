'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthSession } from './auth-types'

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isGuest: boolean
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Fetch session from API (reads HttpOnly cookie)
async function fetchSession(): Promise<AuthSession | null> {
  try {
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    })
    if (response.ok) {
      const data = await response.json()
      return data.session
    }
  } catch (e) {
    console.error('Failed to fetch session:', e)
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadSession = async () => {
    const currentSession = await fetchSession()
    setSession(currentSession)
    setIsLoading(false)
  }

  useEffect(() => {
    loadSession()
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    setSession(null)
  }

  const refreshSession = async () => {
    await loadSession()
  }

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: session !== null,
    isAdmin: session?.role === 'admin',
    isGuest: session?.role === 'guest',
    logout,
    refreshSession,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
