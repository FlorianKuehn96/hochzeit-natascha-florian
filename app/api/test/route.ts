import { NextRequest, NextResponse } from 'next/server'
import { getAllGuests } from '@/lib/db-wrapper'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_TOKEN
    
    if (!redisUrl || !redisToken) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 500 })
    }
    
    const redis = new Redis({ url: redisUrl, token: redisToken })
    
    // Direct Redis access - try both key formats
    const guestList = await redis.smembers('guests:list')
    const directGuests = []
    for (const code of guestList) {
      // Try new format first, then legacy
      let data = await redis.get(`guest:${code}`)
      if (!data) {
        data = await redis.get(`guest:code:${code}`)
      }
      if (data) {
        directGuests.push({ code, data: typeof data === 'string' ? JSON.parse(data) : data })
      }
    }
    
    // Via wrapper
    const wrapperGuests = await getAllGuests()
    
    return NextResponse.json({
      direct: {
        count: directGuests.length,
        guests: directGuests.map(g => g.code)
      },
      wrapper: {
        count: wrapperGuests.length,
        guests: wrapperGuests.map(g => g.code)
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
