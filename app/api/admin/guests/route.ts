import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests, createGuest, deleteGuest } from '@/lib/db-wrapper'
import { parseSessionToken } from '@/lib/auth-utils'
import { generateGuestCode } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

function verifyAdminToken(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7)
  const session = parseSessionToken(token)
  return session?.role === 'admin'
}

/**
 * GET /api/admin/guests
 * Get all guests (admin only)
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const guests = getAllGuests()
    return NextResponse.json({ guests })
  } catch (error) {
    console.error('Get guests error:', error)
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Gästeliste' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/guests
 * Create new guest (admin only)
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { name, email, code: customCode } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name und E-Mail erforderlich' },
        { status: 400 }
      )
    }

    // Generate code if not provided
    const code = customCode || generateGuestCode('readable')

    // Create guest
    const guest = createGuest({
      name,
      email,
      code,
    })

    return NextResponse.json(
      {
        guest,
        message: `Gast "${name}" mit Code ${code} erstellt`,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create guest error:', error)

    if (error.message?.includes('UNIQUE')) {
      return NextResponse.json(
        { error: 'E-Mail oder Code existiert bereits' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Gast konnte nicht erstellt werden' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/guests
 * Delete guest by code (admin only)
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: 'Code erforderlich' },
        { status: 400 }
      )
    }

    const deleted = deleteGuest(code)
    if (!deleted) {
      return NextResponse.json(
        { error: 'Gast nicht gefunden' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: `Gast mit Code ${code} gelöscht`,
    })
  } catch (error) {
    console.error('Delete guest error:', error)
    return NextResponse.json(
      { error: 'Gast konnte nicht gelöscht werden' },
      { status: 500 }
    )
  }
}
