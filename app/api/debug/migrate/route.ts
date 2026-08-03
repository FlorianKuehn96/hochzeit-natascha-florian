import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/db-upstash'

export const dynamic = 'force-dynamic'

// Simple token check – set env var MIGRATE_TOKEN to protect this endpoint
export async function GET(request: NextRequest) {
  // No auth – one‑time migration endpoint (remove after use)
  try {
    const redis = getRedis()
    const codes = await redis.smembers('guests:list')
    let migrated = 0
    for (const code of codes) {
      const legacyKey = `guest:code:${code}`
      const newKey = `guest:${code}`
      const data = await redis.get(legacyKey)
      if (data) {
        await redis.set(newKey, data)
        migrated++
      }
    }
    return NextResponse.json({ migrated, total: codes.length })
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
