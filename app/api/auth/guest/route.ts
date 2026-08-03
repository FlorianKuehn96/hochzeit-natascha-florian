import { NextRequest, NextResponse } from 'next/server'
import { getGuestByCode } from '@/lib/db-wrapper'
import { createSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// Cookie settings
const COOKIE_NAME = 'hochzeit_session'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * POST /api/auth/guest
 * Guest login with code - sets HttpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code erforderlich' },
        { status: 400 }
      )
    }

    // Find guest by code
    const guest = await getGuestByCode(code.trim().toUpperCase())
    if (!guest) {
      return NextResponse.json(
        { error: 'Ungültiger Code' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSessionToken({
      id: guest.id,
      role: 'guest',
      email: guest.email,
      name: guest.name,
      code: guest.code,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    // Create response with HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        code: guest.code,
      },
    })

    // Set HttpOnly cookie
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
  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/guest
 * Guest logout - clears cookie
 */
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true })
  
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
