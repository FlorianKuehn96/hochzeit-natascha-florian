import { NextRequest, NextResponse } from 'next/server'
import * as redisDb from '@/lib/db-upstash'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const guests = await redisDb.getAllGuests()
    return NextResponse.json({count: guests.length, guests: guests.map(g => g.code)})
  } catch (e:any) {
    return NextResponse.json({error:e.message}, {status:500})
  }
}
