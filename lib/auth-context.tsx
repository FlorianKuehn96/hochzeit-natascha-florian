'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthSession } from './auth-types'
import { getCurrentSession, clearSessionFromStorage } from './auth-utils'

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isGuest: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load session from storage on mount
    const currentSession = getCurrentSession()
    setSession(currentSession)
    setIsLoading(false)
  }, [])

  const logout = () => {
    clearSessionFromStorage()
    setSession(null)
  }

  const value: AuthContextType = {
    session,
    isLoading,
    isAuthenticated: session !== null,
    isAdmin: session?.role === 'admin',
    isGuest: session?.role === 'guest',
    logout,
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
