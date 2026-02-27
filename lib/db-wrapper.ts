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
  // Always normalize email for consistency
  const normalizedData = {
    ...data,
    email: data.email.toLowerCase()
  }
  
  try {
    if (hasRedisConfig) {
      const result = await redisDb.createAdmin(normalizedData)
      // Also update memory to keep fallback in sync
      await memoryDb.createAdmin(normalizedData)
      return result
    }
  } catch (error) {
    console.error('[DB] Redis error during createAdmin:', error)
  }
  // Fall back to in-memory or if Redis failed
  return memoryDb.createAdmin(normalizedData)
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  const normalizedEmail = email.toLowerCase()
  try {
    if (hasRedisConfig) {
      const admin = await redisDb.getAdminByEmail(normalizedEmail)
      // If not in Redis, try memory (fallback)
      if (!admin) {
        return await memoryDb.getAdminByEmail(normalizedEmail)
      }
      return admin
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.getAdminByEmail(normalizedEmail)
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase()
  try {
    if (hasRedisConfig) {
      // First try Redis
      const isValid = await redisDb.validateAdminPassword(normalizedEmail, password)
      if (isValid) {
        console.log(`[DB] Password validated via Redis for ${normalizedEmail}`)
        return true
      }
      
      // If Redis returned false, check if admin exists in Redis
      // If exists but password wrong, DON'T try memory fallback
      const redisAdmin = await redisDb.getAdminByEmail(normalizedEmail)
      if (redisAdmin) {
        console.log(`[DB] Admin found in Redis but password wrong: ${normalizedEmail}`)
        return false
      }
      
      // If not in Redis at all, try memory (for legacy/default admins)
      console.log(`[DB] Admin not in Redis, trying memory fallback: ${normalizedEmail}`)
      return await memoryDb.validateAdminPassword(normalizedEmail, password)
    }
  } catch (error) {
    console.error('[DB] Redis error, falling back to memory:', error)
  }
  return memoryDb.validateAdminPassword(normalizedEmail, password)
}

export async function updateAdminPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const normalizedEmail = email.toLowerCase()
  try {
    if (hasRedisConfig) {
      // Update in Redis
      await redisDb.createAdmin({ email: normalizedEmail, password: newPassword })
      // Also update in memory to keep them in sync
      await memoryDb.createAdmin({ email: normalizedEmail, password: newPassword })
      console.log(`[DB] Password updated in both Redis and Memory for ${normalizedEmail}`)
      return true
    } else {
      // Only memory
      await memoryDb.createAdmin({ email: normalizedEmail, password: newPassword })
      console.log(`[DB] Password updated in Memory for ${normalizedEmail}`)
      return true
    }
  } catch (error) {
    console.error('[DB] Error updating admin password:', error)
    return false
  }
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
