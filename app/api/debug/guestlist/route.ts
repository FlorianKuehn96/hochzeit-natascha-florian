import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/db-upstash'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis()
    const codes = await redis.smembers('guests:list')
    const results = []
    for (const code of codes) {
      const newKey = `guest:${code}`
      const legacyKey = `guest:code:${code}`
      const newData = await redis.get(newKey)
      const legacyData = await redis.get(legacyKey)
      results.push({code, newKeyExists: !!newData, legacyKeyExists: !!legacyData})
    }
    return NextResponse.json({codes, results})
  } catch (e:any) {
    return NextResponse.json({error:e.message}, {status:500})
  }
}
