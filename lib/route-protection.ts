// Route Protection & Authentication Middleware
import { redirect } from 'next/navigation'
import { getCurrentSession } from './auth-utils'

/**
 * Protect page from unauthenticated access
 * Redirects to login if not authenticated
 */
export function protectPage() {
  const session = getCurrentSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

/**
 * Protect admin-only pages
 * Redirects to login if not admin
 */
export function protectAdminPage() {
  const session = getCurrentSession()
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
export function protectGuestPage() {
  const session = getCurrentSession()
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
export function redirectIfAuthenticated(redirectTo: string = '/admin') {
  const session = getCurrentSession()
  if (session) {
    redirect(session.role === 'admin' ? '/admin' : '/dashboard')
  }
  return null
}
