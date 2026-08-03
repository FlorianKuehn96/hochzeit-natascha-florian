// Auth Utilities & Helper Functions

import { AuthSession } from './auth-types'
import { SignJWT, jwtVerify } from 'jose'

// JWT Secret from environment variable
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return new TextEncoder().encode(secret)
}

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
 * Create a session JWT token using jose
 */
export async function createSessionToken(session: AuthSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(session.expiresAt / 1000))
    .sign(getJwtSecret())
}

/**
 * Parse & validate session token using jose
 */
export async function parseSessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return {
      id: payload.id as string,
      role: payload.role as 'admin' | 'guest',
      email: payload.email as string,
      expiresAt: payload.expiresAt as number,
    } as AuthSession
  } catch {
    return null
  }
}

/**
 * Get current session from HTTP-only cookie
 * Note: This must be called from server-side or API routes
 * Client-side auth state is managed via cookie + session API
 */
export async function getCurrentSessionFromCookie(request: Request): Promise<AuthSession | null> {
  const cookie = request.headers.get('cookie')
  if (!cookie) return null
  
  // Parse session cookie
  const sessionMatch = cookie.match(/hochzeit_session=([^;]+)/)
  if (!sessionMatch) return null
  
  const token = decodeURIComponent(sessionMatch[1])
  return parseSessionToken(token)
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const session = await getCurrentSessionFromCookie(request)
  return session !== null
}

/**
 * Check if user is admin (server-side)
 */
export async function isAdmin(request: Request): Promise<boolean> {
  const session = await getCurrentSessionFromCookie(request)
  return session?.role === 'admin'
}

/**
 * Check if user is guest (server-side)
 */
export async function isGuest(request: Request): Promise<boolean> {
  const session = await getCurrentSessionFromCookie(request)
  return session?.role === 'guest'
}
