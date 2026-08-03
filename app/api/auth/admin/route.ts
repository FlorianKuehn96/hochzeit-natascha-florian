import { NextRequest, NextResponse } from 'next/server'
import { getAdminByEmail, validateAdminPassword } from '@/lib/db-wrapper'
import { createSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

// Cookie settings
const COOKIE_NAME = 'hochzeit_session'
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days in seconds

/**
 * POST /api/auth/admin
 * Admin login with email & password - sets HttpOnly cookie
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort erforderlich' },
        { status: 400 }
      )
    }

    // Validate credentials
    const isValid = await validateAdminPassword(email, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'E-Mail oder Passwort falsch' },
        { status: 401 }
      )
    }

    const admin = await getAdminByEmail(email)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin nicht gefunden' },
        { status: 401 }
      )
    }

    // Create session token
    const token = await createSessionToken({
      id: email,
      role: 'admin',
      email: email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    // Create response with HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      admin: {
        email,
        role: 'admin',
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
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/auth/admin
 * Admin logout - clears cookie
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
