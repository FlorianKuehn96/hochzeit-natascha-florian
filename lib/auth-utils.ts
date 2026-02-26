// Auth Utilities & Helper Functions

import { AuthSession } from './auth-types'

const SESSION_KEY = 'hochzeit_auth_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

/**
 * Generate a random guest code (format: ABC123XYZ789)
 * Change format parameter to customize
 */
export function generateGuestCode(format: 'simple' | 'readable' = 'readable'): string {
  if (format === 'readable') {
    // Format: NAT001, FLO002, etc.
    const names = ['NAT', 'FLO', 'NAT', 'FLO']
    const randomName = names[Math.floor(Math.random() * names.length)]
    const randomNum = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
    return `${randomName}${randomNum}`
  } else {
    // Format: abc123xyz789
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }
}

/**
 * Create a session JWT token
 * TODO: Replace with actual JWT library (jsonwebtoken)
 */
export function createSessionToken(session: AuthSession): string {
  // Placeholder - will use jsonwebtoken in production
  const payload = {
    ...session,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(session.expiresAt / 1000),
  }
  return Buffer.from(JSON.stringify(payload)).toString('base64')
}

/**
 * Parse & validate session token
 */
export function parseSessionToken(token: string): AuthSession | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    
    // Check expiration
    if (decoded.expiresAt < Date.now()) {
      return null
    }
    
    return {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
      code: decoded.code,
      expiresAt: decoded.expiresAt,
    }
  } catch {
    return null
  }
}

/**
 * Store session in localStorage (client-side)
 */
export function saveSessionToStorage(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, token)
}

/**
 * Get session from localStorage
 */
export function getSessionFromStorage(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_KEY)
}

/**
 * Clear session from localStorage
 */
export function clearSessionFromStorage(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Get current session
 */
export function getCurrentSession(): AuthSession | null {
  const token = getSessionFromStorage()
  if (!token) return null
  return parseSessionToken(token)
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentSession() !== null
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const session = getCurrentSession()
  return session?.role === 'admin'
}

/**
 * Check if user is guest
 */
export function isGuest(): boolean {
  const session = getCurrentSession()
  return session?.role === 'guest'
}
