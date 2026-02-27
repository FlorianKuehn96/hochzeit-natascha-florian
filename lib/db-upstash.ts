// Upstash Redis Database Handler
import { Redis } from '@upstash/redis'
import { Guest, Admin } from './auth-types'
import bcrypt from 'bcryptjs'

// Initialize Redis client from env
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Key prefixes for organization
const KEYS = {
  GUEST: (code: string) => `guest:code:${code}`,
  GUEST_EMAIL: (email: string) => `guest:email:${email}`,
  GUEST_LIST: () => `guests:list`,
  ADMIN: (email: string) => `admin:${email}`,
  ADMIN_LIST: () => `admins:list`,
}

// ===== GUEST OPERATIONS =====

export async function createGuest(data: {
  name: string
  email: string
  code: string
}): Promise<Guest> {
  const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const guest: Guest = {
    id,
    name: data.name,
    email: data.email,
    code: data.code,
    rsvp: {
      status: 'pending',
    },
    createdAt: now,
  }

  // Store in Redis
  await redis.set(KEYS.GUEST(data.code), JSON.stringify(guest))
  await redis.set(KEYS.GUEST_EMAIL(data.email), JSON.stringify(guest))
  await redis.sadd(KEYS.GUEST_LIST(), data.code)

  return guest
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  try {
    const data = await redis.get(KEYS.GUEST(code.toUpperCase()))
    if (!data) return null
    return JSON.parse(data as string)
  } catch (error) {
    console.error('Error fetching guest by code:', error)
    return null
  }
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  try {
    const data = await redis.get(KEYS.GUEST_EMAIL(email.toLowerCase()))
    if (!data) return null
    return JSON.parse(data as string)
  } catch (error) {
    console.error('Error fetching guest by email:', error)
    return null
  }
}

export async function getAllGuests(): Promise<Guest[]> {
  try {
    const codes = await redis.smembers(KEYS.GUEST_LIST())
    if (!codes || codes.length === 0) return []

    const guests: Guest[] = []
    for (const code of codes) {
      const data = await redis.get(KEYS.GUEST(code as string))
      if (data) {
        guests.push(JSON.parse(data as string))
      }
    }

    // Sort by created date descending
    return guests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error fetching all guests:', error)
    return []
  }
}

export async function updateGuestRSVP(
  code: string,
  rsvp: {
    status: 'attending' | 'declined'
    guests?: number
    accommodation?: string
    dietary?: string
    message?: string
  }
): Promise<Guest | null> {
  try {
    const guest = await getGuestByCode(code)
    if (!guest) return null

    const updated: Guest = {
      ...guest,
      rsvp: {
        status: rsvp.status,
        guests: rsvp.guests,
        accommodation: rsvp.accommodation as 'needed' | 'not-needed' | undefined,
        dietary: rsvp.dietary,
        message: rsvp.message,
        submittedAt: new Date().toISOString(),
      },
    }

    await redis.set(KEYS.GUEST(code), JSON.stringify(updated))
    await redis.set(KEYS.GUEST_EMAIL(guest.email), JSON.stringify(updated))

    return updated
  } catch (error) {
    console.error('Error updating guest RSVP:', error)
    return null
  }
}

export async function deleteGuest(code: string): Promise<boolean> {
  try {
    const guest = await getGuestByCode(code)
    if (!guest) return false

    await redis.del(KEYS.GUEST(code))
    await redis.del(KEYS.GUEST_EMAIL(guest.email))
    await redis.srem(KEYS.GUEST_LIST(), code)

    return true
  } catch (error) {
    console.error('Error deleting guest:', error)
    return false
  }
}

// ===== ADMIN OPERATIONS =====

export async function createAdmin(data: {
  email: string
  password: string
  name?: string
}): Promise<{ email: string; name?: string; createdAt: string }> {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()
  const normalizedEmail = data.email.toLowerCase()

  const admin: Admin = {
    email: normalizedEmail,
    password: hashedPassword,
    createdAt: now,
  }

  await redis.set(KEYS.ADMIN(normalizedEmail), JSON.stringify(admin))
  await redis.sadd(KEYS.ADMIN_LIST(), normalizedEmail)

  return {
    email: data.email,
    name: data.name,
    createdAt: now,
  }
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const data = await redis.get(KEYS.ADMIN(email.toLowerCase()))
    if (!data) return null
    return JSON.parse(data as string)
  } catch (error) {
    console.error('Error fetching admin:', error)
    return null
  }
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  try {
    const admin = await getAdminByEmail(email)
    if (!admin) return false
    return await bcrypt.compare(password, admin.password)
  } catch (error) {
    console.error('Error validating admin password:', error)
    return false
  }
}

export async function getAllAdmins(): Promise<any[]> {
  try {
    const emails = await redis.smembers(KEYS.ADMIN_LIST())
    if (!emails) return []

    const admins = []
    for (const email of emails) {
      const data = await redis.get(KEYS.ADMIN(email as string))
      if (data) {
        const admin = JSON.parse(data as string)
        admins.push({
          email: admin.email,
          createdAt: admin.createdAt,
        })
      }
    }
    return admins
  } catch (error) {
    console.error('Error fetching all admins:', error)
    return []
  }
}
