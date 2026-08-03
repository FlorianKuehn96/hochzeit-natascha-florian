import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const results: any = {}
  
  // Step 1: Check env vars
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  results.env = {
    url: redisUrl ? `${redisUrl.substring(0, 30)}...` : 'MISSING',
    token: redisToken ? 'SET' : 'MISSING',
  }
  
  if (!redisUrl || !redisToken) {
    return NextResponse.json(results)
  }
  
  // Step 2: Direct Redis (like debug/redis)
  try {
    const directRedis = new Redis({ url: redisUrl, token: redisToken })
    const directCodes = await directRedis.smembers('guests:list')
    results.directRedis = {
      count: directCodes.length,
      first3: directCodes.slice(0, 3),
    }
  } catch (e: any) {
    results.directRedis = { error: e.message }
  }
  
  // Step 3: Import db-upstash and call getAllGuests
  try {
    const { getAllGuests } = await import('@/lib/db-upstash')
    const guests = await getAllGuests()
    results.dbUpstash = {
      count: guests.length,
      first3: guests.slice(0, 3).map((g: any) => ({ name: g.name, code: g.code })),
    }
  } catch (e: any) {
    results.dbUpstash = { error: e.message, stack: e.stack }
  }
  
  // Step 4: Import db-wrapper and call getAllGuests
  try {
    const { getAllGuests: wrapperGetAll } = await import('@/lib/db-wrapper')
    const guests = await wrapperGetAll()
    results.dbWrapper = {
      count: guests.length,
      first3: guests.slice(0, 3).map((g: any) => ({ name: g.name, code: g.code })),
    }
  } catch (e: any) {
    results.dbWrapper = { error: e.message, stack: e.stack }
  }
  
  return NextResponse.json(results)
}