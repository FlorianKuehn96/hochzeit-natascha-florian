import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests } from '@/lib/db-wrapper'
import { getCurrentSessionFromCookie } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/magic-links
 * Admin-only: Returns all guest magic links
 */
export async function GET(request: NextRequest) {
  const session = await getCurrentSessionFromCookie(request)
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 401 })
  }

  const guests = await getAllGuests()
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const host = request.headers.get('host') || 'hochzeit.natascha-florian.com'

  const links = guests
    .filter(g => g.rsvp.status !== 'declined')
    .map(g => ({
      code: g.code,
      name: g.name,
      email: g.email,
      rsvpStatus: g.rsvp.status,
      guests: g.rsvp.guests || 1,
      magicLink: `${protocol}://${host}/api/auth/magic?code=${g.code}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return NextResponse.json({ count: links.length, links })
}