import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/auth-utils'
import { validateAdminPassword } from '@/lib/db-wrapper'

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

    // Update in database using the updateAdminPassword helper
    // to ensure both Redis and Memory are updated consistently
    const { updateAdminPassword } = await import('@/lib/db-wrapper')
    const updated = await updateAdminPassword(adminEmail, newPassword)
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Passwort konnte nicht aktualisiert werden' },
        { status: 500 }
      )
    }

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
