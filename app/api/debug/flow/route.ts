import { NextRequest, NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN
  
  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: 'no env' })
  }
  
  const results: any = {}
  
  // Test 1: Direct Redis - smembers
  try {
    const r = new Redis({ url: redisUrl, token: redisToken })
    const codes = await r.smembers('guests:list')
    results.test1_smembers = { count: codes.length, codes: codes.slice(0, 3) }
  } catch (e: any) {
    results.test1_smembers = { error: e.message }
  }
  
  // Test 2: Use the EXACT same KEYS function as db-upstash.ts
  const KEYS = {
    GUEST: (code: string) => `guest:code:${code}`,
    GUEST_EMAIL: (email: string) => `guest:email:${email}`,
    GUEST_LIST: () => `guests:list`,
  }
  
  try {
    const r = new Redis({ url: redisUrl, token: redisToken })
    const codes = await r.smembers(KEYS.GUEST_LIST())
    results.test2_keys_func = { count: codes.length, keyUsed: KEYS.GUEST_LIST(), codes: codes.slice(0, 3) }
  } catch (e: any) {
    results.test2_keys_func = { error: e.message }
  }
  
  // Test 3: Fetch a specific guest by code
  try {
    const r = new Redis({ url: redisUrl, token: redisToken })
    const codes = await r.smembers('guests:list')
    if (codes.length > 0) {
      const firstCode = codes[0] as string
      const data = await r.get(KEYS.GUEST(firstCode))
      results.test3_get_guest = { 
        code: firstCode, 
        key: KEYS.GUEST(firstCode),
        found: !!data,
        data: data ? (typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100)) : null,
        type: typeof data,
      }
    }
  } catch (e: any) {
    results.test3_get_guest = { error: e.message }
  }
  
  // Test 4: Import db-upstash with dynamic import and call its internal getRedis
  try {
    const mod = await import('@/lib/db-upstash')
    results.test4_import = { keys: Object.keys(mod) }
    // Try calling getAllGuests
    const guests = await mod.getAllGuests()
    results.test4_import_guests = { count: guests.length }
  } catch (e: any) {
    results.test4_import = { error: e.message, stack: e.stack?.substring(0, 500) }
  }
  
  return NextResponse.json(results)
}