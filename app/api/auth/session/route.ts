import { NextRequest, NextResponse } from 'next/server'
import { parseSessionToken } from '@/lib/auth-utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/auth/session
 * Returns current session from cookie
 */
export async function GET(request: NextRequest) {
  const cookie = request.cookies.get('hochzeit_session')
  
  if (!cookie?.value) {
    return NextResponse.json({ session: null })
  }

  try {
    const session = await parseSessionToken(cookie.value)
    
    if (!session || session.expiresAt < Date.now()) {
      return NextResponse.json({ session: null })
    }
    
    return NextResponse.json({ session })
  } catch {
    return NextResponse.json({ session: null })
  }
}
