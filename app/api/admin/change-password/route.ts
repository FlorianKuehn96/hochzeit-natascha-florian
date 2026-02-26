import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/auth-utils'
import { validateAdminPassword, createAdmin } from '@/lib/db-wrapper'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

function verifyAdminToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const session = parseSessionToken(token)
  
  if (session?.role !== 'admin') {
    return null
  }

  return session.email
}

/**
 * POST /api/admin/change-password
 * Change admin password
 */
export async function POST(request: NextRequest) {
  const adminEmail = verifyAdminToken(request)
  
  if (!adminEmail) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const { oldPassword, newPassword } = body

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Alte und neue Passwörter erforderlich' },
        { status: 400 }
      )
    }

    // Validate old password
    const isValid = await validateAdminPassword(adminEmail, oldPassword)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Aktuelles Passwort ist falsch' },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update in database
    // TODO: Create updateAdmin function or use direct update
    // For now, we'll create a new admin entry which will overwrite
    await createAdmin({
      email: adminEmail,
      password: newPassword,
    })

    return NextResponse.json({
      message: 'Passwort erfolgreich geändert',
    })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'Passwort konnte nicht geändert werden' },
      { status: 500 }
    )
  }
}
