import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/db-upstash'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis()
    
    // Schritt 1: Hole alle Codes aus der Set
    const codes = await redis.smembers('guests:list')
    
    // Schritt 2: Hole für jeden Code die Daten
    const guests = []
    for (const code of codes) {
      const data = await redis.get(`guest:${code}`)
      if (data) {
        // Upstash Redis gibt bereits geparste Objekte zurück
        const guest = typeof data === 'string' ? JSON.parse(data) : data
        guests.push(guest)
      }
    }
    
    return NextResponse.json({
      codeCount: codes.length,
      guestCount: guests.length,
      codes: codes,
      guests: guests.map(g => ({ code: g.code, name: g.name }))
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
