import { NextRequest, NextResponse } from 'next/server'
import { getAdminByEmail, validateAdminPassword } from '@/lib/db'
import { createSessionToken } from '@/lib/auth-utils'

/**
 * POST /api/auth/admin
 * Admin login with email & password
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

    const admin = getAdminByEmail(email)
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin nicht gefunden' },
        { status: 401 }
      )
    }

    // Create session token
    const token = createSessionToken({
      id: email,
      role: 'admin',
      email: email,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return NextResponse.json({
      token,
      admin: {
        email,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
