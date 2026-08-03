// Route Protection & Authentication Middleware
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseSessionToken } from './auth-utils'

/**
 * Get session from cookie (Server Component)
 */
async function getServerSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('hochzeit_session')
  
  if (!sessionCookie?.value) {
    return null
  }
  
  return parseSessionToken(sessionCookie.value)
}

/**
 * Protect page from unauthenticated access
 * Redirects to login if not authenticated
 */
export async function protectPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Protect admin-only pages
 * Redirects to login if not admin
 */
export async function protectAdminPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  if (session.role !== 'admin') {
    redirect('/login')
  }
  return session
}

/**
 * Protect guest-only pages
 * Redirects to login if not guest
 */
export async function protectGuestPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }
  if (session.role !== 'guest') {
    redirect('/login')
  }
  return session
}

/**
 * Redirect if already logged in
 * (e.g., login page should redirect to dashboard if already logged in)
 */
export async function redirectIfAuthenticated(redirectTo: string = '/admin') {
  const session = await getServerSession()
  if (session) {
    redirect(session.role === 'admin' ? '/admin' : '/dashboard')
  }
  return null
}
