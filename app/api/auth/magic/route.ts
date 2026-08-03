import { NextRequest, NextResponse } from 'next/server'
import { getGuestByCode } from '@/lib/db-wrapper'
import { createSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const COOKIE_NAME = 'hochzeit_session'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

/**
 * GET /api/auth/magic?code=XXX
 * Magic link login: validates guest code, sets session cookie, redirects to dashboard
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  // Find guest by code
  const guest = await getGuestByCode(code.trim().toUpperCase())
  if (!guest) {
    return NextResponse.redirect(new URL('/login?error=invalid_code', request.url))
  }

  // Create session token
  const token = await createSessionToken({
    id: guest.id,
    role: 'guest',
    email: guest.email,
    name: guest.name,
    code: guest.code,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  })

  // Determine redirect URL - use the host from the request
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'hochzeit.natascha-florian.com'

  // Smart redirect: guests who accepted but haven't chosen their meal → /meal
  // Everyone else → / (startseite)
  let path = '/'
  if (guest.rsvp.status === 'attending' && !guest.mealChoice?.selections?.length) {
    path = '/meal'
  }
  const redirectUrl = `${protocol}://${host}${path}`

  // Set HttpOnly cookie and redirect
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return response
}