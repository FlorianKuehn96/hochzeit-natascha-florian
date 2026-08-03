import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/db-upstash'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({error:'code missing'}, {status:400})
  try {
    const redis = getRedis()
    const dataNew = await redis.get(`guest:${code}`)
    const dataLegacy = await redis.get(`guest:code:${code}`)
    return NextResponse.json({code, new: !!dataNew, legacy: !!dataLegacy, newData: dataNew, legacyData: dataLegacy})
  } catch (e:any) {
    return NextResponse.json({error:e.message}, {status:500})
  }
}
