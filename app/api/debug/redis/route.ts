import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    console.log('[Debug] Redis URL:', redisUrl ? 'configured' : 'MISSING')
    console.log('[Debug] Redis Token:', redisToken ? 'configured' : 'MISSING')
    
    if (!redisUrl || !redisToken) {
      return NextResponse.json({
        error: 'Redis not configured',
        url: redisUrl ? 'set' : 'missing',
        token: redisToken ? 'set' : 'missing',
      }, { status: 500 })
    }
    
    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    
    // Test Redis connection
    const pingResult = await redis.ping()
    
    // Try to get guests list
    const guestList = await redis.smembers('guests:list')
    
    return NextResponse.json({
      status: 'ok',
      ping: pingResult,
      guestCount: guestList.length,
      guests: guestList,
    })
  } catch (error: any) {
    console.error('[Debug] Redis error:', error)
    return NextResponse.json({
      error: 'Redis connection failed',
      message: error.message,
    }, { status: 500 })
  }
}
