import { NextRequest, NextResponse } from 'next/server'
import { updateGuestRSVP, getGuestByCode } from '@/lib/db-wrapper'
import { getCurrentSessionFromCookie } from '@/lib/auth-utils'
import { sendRSVPEmail, sendGuestConfirmation } from '@/lib/email'

export const dynamic = 'force-dynamic'

/**
 * GET /api/rsvp
 * Get current guest's RSVP status - requires authenticated guest session
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getCurrentSessionFromCookie(request)
    if (!session || session.role !== 'guest' || !session.code) {
      return NextResponse.json({ error: 'Nicht eingeloggt.' }, { status: 401 })
    }

    const guest = await getGuestByCode(session.code)
    if (!guest) {
      return NextResponse.json({ error: 'Gast nicht gefunden.' }, { status: 404 })
    }

    return NextResponse.json({ guest })
  } catch (error) {
    console.error('[RSVP GET] Error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

/**
 * POST /api/rsvp
 * Submit RSVP - requires authenticated guest session (magic link or code login)
 */
export async function POST(request: NextRequest) {
  try {
    // Must be logged in as guest
    const session = await getCurrentSessionFromCookie(request)
    if (!session || session.role !== 'guest' || !session.code) {
      return NextResponse.json({ error: 'Nicht eingeloggt. Bitte benutze deinen persönlichen Link.' }, { status: 401 })
    }

    const guest = await getGuestByCode(session.code)
    if (!guest) {
      return NextResponse.json({ error: 'Gast nicht gefunden.' }, { status: 404 })
    }

    const body = await request.json()
    const { attending, guests, accommodation, dietary, message, name, email } = body

    if (attending === null || attending === undefined) {
      return NextResponse.json({ error: 'Bitte wähle, ob du kommst oder nicht' }, { status: 400 })
    }

    // Update RSVP
    const rsvpData: {
      status: 'attending' | 'declined'
      guests?: number
      accommodation?: string
      dietary?: string
      message?: string
    } = {
      status: attending ? 'attending' : 'declined',
    }

    if (attending) {
      rsvpData.guests = parseInt(guests) || 1
      rsvpData.accommodation = accommodation || 'not-needed'
      rsvpData.dietary = dietary || ''
      rsvpData.message = message || ''
    } else {
      rsvpData.guests = 1
      rsvpData.accommodation = 'not-needed'
      rsvpData.dietary = ''
      rsvpData.message = message || ''
    }

    // Update guest profile (name/email from form) along with RSVP
    const guestUpdates: { name?: string; email?: string } = {}
    if (name && name !== guest.name) guestUpdates.name = name
    if (email && email !== guest.email) guestUpdates.email = email

    const updated = await updateGuestRSVP(guest.code, rsvpData, Object.keys(guestUpdates).length > 0 ? guestUpdates : undefined)
    if (!updated) {
      return NextResponse.json({ error: 'Fehler beim Speichern der Zusage' }, { status: 500 })
    }

    // Use email from form if provided, otherwise guest's stored email
    const guestEmail = email || guest.email
    const guestName = name || guest.name

    // Send notification email to admin
    let adminEmailSent = false
    try {
      adminEmailSent = await sendRSVPEmail({
        guestName: guestName,
        guestEmail: guestEmail,
        status: rsvpData.status,
        guests: rsvpData.guests,
        accommodation: rsvpData.accommodation,
        dietary: rsvpData.dietary,
        message: rsvpData.message,
      })
    } catch (err) {
      console.error('[RSVP] Admin email error:', err)
    }

    // Send confirmation email to guest
    let guestEmailSent = false
    if (guestEmail) {
      try {
        guestEmailSent = await sendGuestConfirmation({
          guestName: guestName,
          guestEmail: guestEmail,
          guestCode: guest.code,
          status: rsvpData.status,
          guests: rsvpData.guests,
          accommodation: rsvpData.accommodation,
          dietary: rsvpData.dietary,
          message: rsvpData.message,
        })
      } catch (err) {
        console.error('[RSVP] Guest email error:', err)
      }
    }

    return NextResponse.json({ success: true, guest: updated, emails: { admin: adminEmailSent, guest: guestEmailSent, guestEmail: guestEmail || null } })
  } catch (error) {
    console.error('[RSVP] Error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}