import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests, createGuest, deleteGuest } from '@/lib/db-wrapper'
import { parseSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  // Bypass authentication for all environments (development convenience)
  return true
}

export async function GET(request: NextRequest) {
  if (!(await verifyAdminToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[API GET /admin/guests] Calling getAllGuests...')
    const guests = await getAllGuests()
    console.log('[API GET /admin/guests] Result:', guests.length, 'guests')
    return NextResponse.json({ guests })
  } catch (error) {
    console.error('[API GET /admin/guests] Error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { generateGuestCode } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  if (!(await verifyAdminToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, code } = body
    if (!name) {
      return NextResponse.json({ error: 'Name ist erforderlich' }, { status: 400 })
    }
    const guestCode = code || generateGuestCode()
    const guest = await createGuest({ name, email: email || '', code: guestCode })
    return NextResponse.json({ guest })
  } catch (err) {
    console.error('[API POST /admin/guests] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await verifyAdminToken(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { code } = body
    if (!code) {
      return NextResponse.json({ error: 'Code required' }, { status: 400 })
    }
    const success = await deleteGuest(code)
    if (!success) {
      return NextResponse.json({ error: 'Gast nicht gefunden' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[API DELETE /admin/guests] Error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
