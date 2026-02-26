import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/admin
 * Admin login with email & password
 * 
 * TODO:
 * - Validate email & password against admin database
 * - Use bcrypt to compare password hash
 * - Create JWT token
 * - Return token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-Mail und Passwort erforderlich' },
        { status: 400 }
      )
    }

    // TODO: Validate against admin database
    // const admin = await db.admins.findByEmail(email)
    // if (!admin) {
    //   return NextResponse.json({ error: 'Admin nicht gefunden' }, { status: 401 })
    // }
    
    // const isPasswordValid = await bcrypt.compare(password, admin.password)
    // if (!isPasswordValid) {
    //   return NextResponse.json({ error: 'Passwort falsch' }, { status: 401 })
    // }

    // TODO: Create JWT token
    // const token = createToken({
    //   id: admin.email,
    //   role: 'admin',
    //   email: admin.email,
    // })

    // Placeholder response
    return NextResponse.json({
      token: 'placeholder_token_admin',
      admin: {
        email: email,
        role: 'admin',
      },
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    )
  }
}
