import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/guest
 * Guest login with code
 * 
 * TODO: 
 * - Validate code against guest database
 * - Create JWT token
 * - Return token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Code erforderlich' },
        { status: 400 }
      )
    }

    // TODO: Validate code against database
    // const guest = await db.guests.findByCode(code)
    // if (!guest) {
    //   return NextResponse.json({ error: 'Ungültiger Code' }, { status: 401 })
    // }

    // TODO: Create JWT token
    // const token = createToken({
    //   id: guest.id,
    //   role: 'guest',
    //   email: guest.email,
    //   code: guest.code,
    // })

    // Placeholder response
    return NextResponse.json({
      token: 'placeholder_token_guest',
      guest: {
        id: 'guest_123',
        name: 'Test Guest',
        email: 'guest@test.de',
        code: code,
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
