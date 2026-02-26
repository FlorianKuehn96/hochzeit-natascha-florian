// Database Wrapper - tries Upstash Redis, falls back to in-memory

import * as redisDb from './db-upstash'
import * as memoryDb from './db-memory'
import { Guest, Admin } from './auth-types'

// Check if Redis env vars are available
const hasRedisConfig = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
)

console.log(`[DB] Using: ${hasRedisConfig ? 'Redis (Upstash)' : 'In-Memory (Fallback)'}`)

// ===== GUEST OPERATIONS =====

export async function createGuest(data: {
  name: string
  email: string
  code: string
}): Promise<Guest> {
  try {
    if (hasRedisConfig) {
      return await redisDb.createGuest(data)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.createGuest(data)
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  try {
    if (hasRedisConfig) {
      return await redisDb.getGuestByCode(code)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getGuestByCode(code)
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  try {
    if (hasRedisConfig) {
      return await redisDb.getGuestByEmail(email)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getGuestByEmail(email)
}

export async function getAllGuests(): Promise<Guest[]> {
  try {
    if (hasRedisConfig) {
      return await redisDb.getAllGuests()
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getAllGuests()
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
    if (hasRedisConfig) {
      return await redisDb.updateGuestRSVP(code, rsvp)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.updateGuestRSVP(code, rsvp)
}

export async function deleteGuest(code: string): Promise<boolean> {
  try {
    if (hasRedisConfig) {
      return await redisDb.deleteGuest(code)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.deleteGuest(code)
}

// ===== ADMIN OPERATIONS =====

export async function createAdmin(data: {
  email: string
  password: string
  name?: string
}): Promise<{ email: string; name?: string; createdAt: string }> {
  try {
    if (hasRedisConfig) {
      return await redisDb.createAdmin(data)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.createAdmin(data)
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  try {
    if (hasRedisConfig) {
      const admin = await redisDb.getAdminByEmail(email)
      // If not in Redis, try memory (fallback)
      if (!admin) {
        return await memoryDb.getAdminByEmail(email)
      }
      return admin
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getAdminByEmail(email)
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  try {
    if (hasRedisConfig) {
      // First try Redis
      const isValid = await redisDb.validateAdminPassword(email, password)
      if (isValid) return true
      
      // If not valid in Redis, try memory (fallback to default admins)
      return await memoryDb.validateAdminPassword(email, password)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.validateAdminPassword(email, password)
}

export async function getAllAdmins(): Promise<any[]> {
  try {
    if (hasRedisConfig) {
      return await redisDb.getAllAdmins()
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getAllAdmins()
}
