import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests } from '@/lib/db-wrapper'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    const envCheck = {
      redisUrl: redisUrl ? `${redisUrl.substring(0, 20)}...` : 'MISSING',
      redisToken: redisToken ? `${redisToken.substring(0, 10)}...` : 'MISSING',
      nodeEnv: process.env.NODE_ENV,
    }
    
    console.log('[Debug DB] Env check:', envCheck)
    
    const guests = await getAllGuests()
    
    return NextResponse.json({
      envCheck,
      guestCount: guests.length,
      guests: guests.slice(0, 3),
    })
  } catch (error: any) {
    console.error('[Debug DB] Error:', error)
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}
