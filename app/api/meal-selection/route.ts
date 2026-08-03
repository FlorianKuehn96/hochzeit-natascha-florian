import { NextRequest, NextResponse } from 'next/server'
import { updateGuestMealChoice, getGuestByCode } from '@/lib/db-wrapper'
import { getCurrentSessionFromCookie } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const VALID_CHOICES = ['beef', 'fish', 'vegan'] as const

/**
 * GET /api/meal-selection
 * Get current guest's meal choice + number of required selections
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

    // Number of adults = rsvp.guests if >= 2, else 1
    // (children get Kinderteller, so only adults choose from the menu)
    const numAdults = guest.rsvp.status === 'attending'
      ? (guest.rsvp.guests && guest.rsvp.guests >= 2 ? 2 : 1)
      : 0

    return NextResponse.json({
      guest: {
        code: guest.code,
        name: guest.name,
        rsvpStatus: guest.rsvp.status,
        rsvpGuests: guest.rsvp.guests || 1,
        numAdults,
        mealChoice: guest.mealChoice || null,
      },
    })
  } catch (error) {
    console.error('[Meal Selection GET] Error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}

/**
 * POST /api/meal-selection
 * Submit meal selections — array of choices, one per adult (max 2)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentSessionFromCookie(request)
    if (!session || session.role !== 'guest' || !session.code) {
      return NextResponse.json({ error: 'Nicht eingeloggt. Bitte benutze deinen persönlichen Link.' }, { status: 401 })
    }

    const guest = await getGuestByCode(session.code)
    if (!guest) {
      return NextResponse.json({ error: 'Gast nicht gefunden.' }, { status: 404 })
    }

    if (guest.rsvp.status !== 'attending') {
      return NextResponse.json({ error: 'Du kannst nur eine Essensauswahl treffen, wenn du zugesagt hast.' }, { status: 400 })
    }

    const body = await request.json()
    const { selections } = body

    // Determine required number of selections
    const numAdults = guest.rsvp.guests && guest.rsvp.guests >= 2 ? 2 : 1

    if (!Array.isArray(selections) || selections.length !== numAdults) {
      return NextResponse.json({
        error: `Bitte wähle genau ${numAdults} ${numAdults === 1 ? 'Hauptgang' : 'Hauptgänge'} aus.`
      }, { status: 400 })
    }

    // Validate all choices
    for (const choice of selections) {
      if (!VALID_CHOICES.includes(choice as any)) {
        return NextResponse.json({ error: 'Ungültige Auswahl. Bitte wähle aus den verfügbaren Gerichten.' }, { status: 400 })
      }
    }

    const updated = await updateGuestMealChoice(guest.code, selections)
    if (!updated) {
      return NextResponse.json({ error: 'Fehler beim Speichern der Essensauswahl' }, { status: 500 })
    }

    return NextResponse.json({ success: true, guest: updated })
  } catch (error) {
    console.error('[Meal Selection POST] Error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}