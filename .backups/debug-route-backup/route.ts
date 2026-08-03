import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Check if env vars are set
  const hasRedisUrl = !!process.env.UPSTASH_REDIS_REST_URL
  const hasRedisToken = !!process.env.UPSTASH_REDIS_REST_TOKEN

  return NextResponse.json({
    env: {
      UPSTASH_REDIS_REST_URL: hasRedisUrl ? '✅ Set' : '❌ Missing',
      UPSTASH_REDIS_REST_TOKEN: hasRedisToken ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV,
    },
    message: 'Debug info - remove in production',
  })
}
