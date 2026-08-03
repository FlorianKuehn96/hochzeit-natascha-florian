// Upstash Redis Database Handler
import { Redis } from '@upstash/redis'
import { Guest, Admin } from './auth-types'
import bcrypt from 'bcryptjs'

// Lazy Redis client initialization
let redis: Redis | null = null

function getRedis(): Redis {
  if (!redis) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

    console.log('[Redis Lazy Init] URL:', redisUrl ? 'SET' : 'MISSING')
    console.log('[Redis Lazy Init] Token:', redisToken ? 'SET' : 'MISSING')

    if (!redisUrl || !redisToken) {
      throw new Error('[Redis] Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN')
    }

    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    
    // Test connection
    redis.ping().then(() => {
      console.log('[Redis] Connection successful')
    }).catch((err) => {
      console.error('[Redis] Connection failed:', err)
    })
  }
  return redis
}

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
  const redis = getRedis()
  const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const upperCode = data.code.toUpperCase()
  const lowerEmail = data.email.toLowerCase()
  
  const guest: Guest = {
    id,
    name: data.name,
    email: lowerEmail,
    code: upperCode,
    rsvp: {
      status: 'pending',
    },
    createdAt: now,
  }

  // Store in Redis
  await redis.set(KEYS.GUEST(upperCode), JSON.stringify(guest))
  await redis.set(KEYS.GUEST_EMAIL(lowerEmail), JSON.stringify(guest))
  await redis.sadd(KEYS.GUEST_LIST(), upperCode)

  return guest
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  try {
    const redis = getRedis()
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
    const redis = getRedis()
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
    console.log('[getAllGuests] Starting...')
    const redis = getRedis()
    const codes = await redis.smembers(KEYS.GUEST_LIST())
    console.log('[getAllGuests] Found codes:', codes)
    
    if (!codes || codes.length === 0) {
      console.log('[getAllGuests] No guests found')
      return []
    }

    const guests: Guest[] = []
    for (const code of codes) {
      console.log(`[getAllGuests] Fetching guest: ${code}`)
      const data = await redis.get(KEYS.GUEST(code as string))
      console.log(`[getAllGuests] Data for ${code}:`, data ? 'found' : 'not found')
      if (data) {
        try {
          const guest = JSON.parse(data as string)
          guests.push(guest)
        } catch (e) {
          console.error(`[getAllGuests] Parse error for ${code}:`, e)
        }
      }
    }

    console.log(`[getAllGuests] Returning ${guests.length} guests`)
    
    // Sort by created date descending
    return guests.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('[getAllGuests] Error:', error)
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
    const redis = getRedis()
    const guest = await getGuestByCode(code)
    if (!guest) return null

    const updatedGuest: Guest = {
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

    await redis.set(KEYS.GUEST(guest.code), JSON.stringify(updatedGuest))
    await redis.set(KEYS.GUEST_EMAIL(guest.email), JSON.stringify(updatedGuest))

    return updatedGuest
  } catch (error) {
    console.error('Error updating guest RSVP:', error)
    return null
  }
}

export async function deleteGuest(code: string): Promise<boolean> {
  try {
    const redis = getRedis()
    const guest = await getGuestByCode(code)
    if (!guest) return false

    await redis.del(KEYS.GUEST(guest.code))
    await redis.del(KEYS.GUEST_EMAIL(guest.email))
    await redis.srem(KEYS.GUEST_LIST(), guest.code)

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
  const redis = getRedis()
  const hashedPassword = await bcrypt.hash(data.password, 10)
  
  const admin = {
    email: data.email.toLowerCase(),
    password: hashedPassword,
    name: data.name,
    createdAt: new Date().toISOString(),
  }

  await redis.set(KEYS.ADMIN(admin.email), JSON.stringify(admin))
  await redis.sadd(KEYS.ADMIN_LIST(), admin.email)

  return {
    email: admin.email,
    name: admin.name,
    createdAt: admin.createdAt,
  }
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    const redis = getRedis()
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
    if (!admin) {
      console.log(`[validateAdminPassword] Admin not found: ${email}`)
      return false
    }
    
    const isValid = await bcrypt.compare(password, admin.password)
    console.log(`[validateAdminPassword] Password check for ${email}: ${isValid}`)
    return isValid
  } catch (error) {
    console.error('Error validating admin password:', error)
    return false
  }
}

export async function getAllAdmins(): Promise<Admin[]> {
  try {
    const redis = getRedis()
    const emails = await redis.smembers(KEYS.ADMIN_LIST())
    if (!emails || emails.length === 0) return []

    const admins: Admin[] = []
    for (const email of emails) {
      const data = await redis.get(KEYS.ADMIN(email as string))
      if (data) {
        admins.push(JSON.parse(data as string))
      }
    }

    return admins.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error fetching all admins:', error)
    return []
  }
}
