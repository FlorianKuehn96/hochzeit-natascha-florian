// Redis Database Handler for Vercel Serverless
import { Redis } from '@upstash/redis'
import { Guest, Admin } from './auth-types'

// Initialize Redis client
const redis = new Redis({
  url: process.env.REDIS_URL || '',
  token: process.env.REDIS_TOKEN || '',
})

const GUEST_PREFIX = 'guest:'
const ADMIN_PREFIX = 'admin:'
const EMAIL_TO_CODE_PREFIX = 'email:'

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

  // Store guest by code
  await redis.set(`${GUEST_PREFIX}${data.code}`, JSON.stringify(guest))
  
  // Map email to code for lookup
  await redis.set(`${EMAIL_TO_CODE_PREFIX}${data.email.toLowerCase()}`, data.code)

  return guest
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  const data = await redis.get<string>(`${GUEST_PREFIX}${code}`)
  if (!data) return null
  
  try {
    return JSON.parse(data) as Guest
  } catch {
    return null
  }
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  const code = await redis.get<string>(`${EMAIL_TO_CODE_PREFIX}${email.toLowerCase()}`)
  if (!code) return null
  
  return getGuestByCode(code)
}

export async function getAllGuests(): Promise<Guest[]> {
  // Get all keys matching guest:*
  const keys = await redis.keys(`${GUEST_PREFIX}*`)
  if (!keys || keys.length === 0) return []

  const guests: Guest[] = []
  
  for (const key of keys) {
    const data = await redis.get<string>(key)
    if (data) {
      try {
        guests.push(JSON.parse(data) as Guest)
      } catch {
        // Skip invalid entries
      }
    }
  }

  // Sort by createdAt descending
  return guests.sort((a, b) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
}

export async function updateGuestRSVP(
  code: string,
  rsvp: {
    status: 'attending' | 'declined'
    guests?: number
    accommodation?: string
    dietary?: string
    message?: string
  },
  updates?: {
    name?: string
    email?: string
  }
): Promise<Guest | null> {
  const guest = await getGuestByCode(code)
  if (!guest) return null

  const now = new Date().toISOString()

  // If email changed, update email mapping
  let updatedEmail = guest.email
  if (updates?.email && updates.email !== guest.email) {
    // Remove old email mapping
    if (guest.email) {
      await redis.del(`${EMAIL_TO_CODE_PREFIX}${guest.email.toLowerCase()}`)
    }
    // Add new email mapping
    await redis.set(`${EMAIL_TO_CODE_PREFIX}${updates.email.toLowerCase()}`, code)
    updatedEmail = updates.email
  }
  
  const updatedGuest: Guest = {
    ...guest,
    name: updates?.name || guest.name,
    email: updatedEmail,
    rsvp: {
      status: rsvp.status,
      guests: rsvp.guests,
      accommodation: rsvp.accommodation as 'needed' | 'not-needed' | undefined,
      dietary: rsvp.dietary,
      message: rsvp.message,
      submittedAt: now,
    },
  }

  await redis.set(`${GUEST_PREFIX}${code}`, JSON.stringify(updatedGuest))
  
  return updatedGuest
}

export async function deleteGuest(code: string): Promise<boolean> {
  const guest = await getGuestByCode(code)
  if (!guest) return false

  // Delete guest data
  await redis.del(`${GUEST_PREFIX}${code}`)
  
  // Delete email mapping
  if (guest.email) {
    await redis.del(`${EMAIL_TO_CODE_PREFIX}${guest.email.toLowerCase()}`)
  }

  return true
}

// ===== ADMIN OPERATIONS =====

export async function createAdmin(data: { email: string; password: string; name?: string }) {
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()

  const admin = {
    email: data.email.toLowerCase(),
    password: hashedPassword,
    name: data.name,
    createdAt: now,
  }

  await redis.set(`${ADMIN_PREFIX}${data.email.toLowerCase()}`, JSON.stringify(admin))

  return {
    email: data.email,
    name: data.name,
    createdAt: now,
  }
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const data = await redis.get<string>(`${ADMIN_PREFIX}${email.toLowerCase()}`)
  if (!data) return null

  try {
    return JSON.parse(data) as Admin
  } catch {
    return null
  }
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  const admin = await getAdminByEmail(email)

  if (!admin) return false

  return await bcrypt.compare(password, admin.password)
}

export async function getAllAdmins() {
  const keys = await redis.keys(`${ADMIN_PREFIX}*`)
  if (!keys || keys.length === 0) return []

  const admins = []
  
  for (const key of keys) {
    const data = await redis.get<string>(key)
    if (data) {
      try {
        const admin = JSON.parse(data)
        admins.push({
          email: admin.email,
          name: admin.name,
          createdAt: admin.createdAt,
        })
      } catch {
        // Skip invalid entries
      }
    }
  }

  return admins.sort((a: any, b: any) => 
    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  )
}

// ===== UTILS =====

export function closeDB() {
  // Redis client doesn't need explicit closing in serverless
}
