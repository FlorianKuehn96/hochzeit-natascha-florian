import { NextRequest, NextResponse } from 'next/server'
import { updateGuestMealChoice, getGuestByCode } from '@/lib/db-wrapper'
import { getCurrentSessionFromCookie } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

const VALID_CHOICES = ['beef', 'fish', 'vegetarian', 'vegan'] as const
type MealChoice = typeof VALID_CHOICES[number]

/**
 * GET /api/meal-selection
 * Get current guest's meal choice
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

    return NextResponse.json({
      guest: {
        code: guest.code,
        name: guest.name,
        rsvpStatus: guest.rsvp.status,
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
 * Submit meal choice — requires authenticated guest session with RSVP status 'attending'
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
    const { mainCourse } = body

    if (!mainCourse || !VALID_CHOICES.includes(mainCourse)) {
      return NextResponse.json({ error: 'Bitte wähle einen gültigen Hauptgang.' }, { status: 400 })
    }

    const updated = await updateGuestMealChoice(guest.code, mainCourse as MealChoice)
    if (!updated) {
      return NextResponse.json({ error: 'Fehler beim Speichern der Essensauswahl' }, { status: 500 })
    }

    return NextResponse.json({ success: true, guest: updated })
  } catch (error) {
    console.error('[Meal Selection POST] Error:', error)
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 })
  }
}