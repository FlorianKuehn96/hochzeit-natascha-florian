// In-Memory Fallback Database (for development/fallback)
// Used when Redis is unavailable

import { Guest, Admin } from './auth-types'
import bcrypt from 'bcryptjs'

// In-memory storage
const guestsMap = new Map<string, Guest>()
const adminsMap = new Map<string, Admin>()
const guestsList: string[] = []

// Initialize with default admin accounts
async function initializeDefaults() {
  const adminPassword1 = await bcrypt.hash('changeme123', 10)
  const adminPassword2 = await bcrypt.hash('changeme456', 10)

  adminsMap.set('schmittnatascha92@yahoo.de', {
    email: 'schmittnatascha92@yahoo.de',
    password: adminPassword1,
    createdAt: new Date().toISOString(),
  })

  adminsMap.set('florian.kuehn96@gmx.de', {
    email: 'florian.kuehn96@gmx.de',
    password: adminPassword2,
    createdAt: new Date().toISOString(),
  })
}

// Initialize on first import
initializeDefaults().catch(console.error)

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

  guestsMap.set(data.code, guest)
  guestsList.push(data.code)

  return guest
}

export async function getGuestByCode(code: string): Promise<Guest | null> {
  return guestsMap.get(code.toUpperCase()) || null
}

export async function getGuestByEmail(email: string): Promise<Guest | null> {
  for (const guest of guestsMap.values()) {
    if (guest.email.toLowerCase() === email.toLowerCase()) {
      return guest
    }
  }
  return null
}

export async function getAllGuests(): Promise<Guest[]> {
  return Array.from(guestsMap.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
  }
): Promise<Guest | null> {
  const guest = guestsMap.get(code)
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

  guestsMap.set(code, updated)
  return updated
}

export async function deleteGuest(code: string): Promise<boolean> {
  const guest = guestsMap.get(code)
  if (!guest) return false

  guestsMap.delete(code)
  const index = guestsList.indexOf(code)
  if (index > -1) {
    guestsList.splice(index, 1)
  }

  return true
}

// ===== ADMIN OPERATIONS =====

export async function createAdmin(data: {
  email: string
  password: string
  name?: string
}): Promise<{ email: string; name?: string; createdAt: string }> {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()

  const admin: Admin = {
    email: data.email.toLowerCase(),
    password: hashedPassword,
    createdAt: now,
  }

  adminsMap.set(data.email.toLowerCase(), admin)

  return {
    email: data.email,
    name: data.name,
    createdAt: now,
  }
}

export async function getAdminByEmail(email: string): Promise<Admin | null> {
  return adminsMap.get(email.toLowerCase()) || null
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  const admin = adminsMap.get(email.toLowerCase())
  if (!admin) return false
  return await bcrypt.compare(password, admin.password)
}

export async function getAllAdmins(): Promise<any[]> {
  return Array.from(adminsMap.values()).map((admin) => ({
    email: admin.email,
    createdAt: admin.createdAt,
  }))
}
