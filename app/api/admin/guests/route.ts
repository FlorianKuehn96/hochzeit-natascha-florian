import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests } from '@/lib/db-wrapper'
import { parseSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

async function verifyAdminToken(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get('hochzeit_session')
  if (sessionCookie?.value) {
    const session = await parseSessionToken(sessionCookie.value)
    return session?.role === 'admin'
  }
  return false
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
