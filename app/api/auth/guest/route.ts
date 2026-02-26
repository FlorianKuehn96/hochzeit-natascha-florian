import { NextRequest, NextResponse } from 'next/server'
import { getGuestByCode } from '@/lib/db'
import { createSessionToken } from '@/lib/auth-utils'

/**
 * POST /api/auth/guest
 * Guest login with code
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
    const guest = getGuestByCode(code.trim().toUpperCase())
    if (!guest) {
      return NextResponse.json(
        { error: 'Ungültiger Code' },
        { status: 401 }
      )
    }

    // Create session token
    const token = createSessionToken({
      id: guest.id,
      role: 'guest',
      email: guest.email,
      name: guest.name,
      code: guest.code,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return NextResponse.json({
      token,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        code: guest.code,
      },
    })
  } catch (error) {
    console.error('Guest login error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
