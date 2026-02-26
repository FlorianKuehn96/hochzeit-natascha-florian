// SQLite Database Handler
import Database from 'better-sqlite3'
import path from 'path'
import { Guest, Admin } from './auth-types'

// Database file path (Vercel uses /tmp or process.cwd())
const dbPath = path.join(process.cwd(), 'data', 'hochzeit.db')

let db: Database.Database | null = null

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(dbPath)
    db.pragma('journal_mode = WAL')
    initializeDatabase()
  }
  return db
}

function initializeDatabase() {
  const database = getDB()

  // Guests table
  database.exec(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      rsvp_status TEXT DEFAULT 'pending',
      rsvp_guests INTEGER,
      rsvp_accommodation TEXT,
      rsvp_dietary TEXT,
      rsvp_message TEXT,
      rsvp_submitted_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `)

  // Admins table
  database.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      email TEXT PRIMARY KEY,
      password TEXT NOT NULL,
      name TEXT,
      created_at TEXT NOT NULL
    )
  `)

  // Create indexes
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_guests_code ON guests(code);
    CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);
  `)
}

// ===== GUEST OPERATIONS =====

export function createGuest(data: {
  name: string
  email: string
  code: string
}): Guest {
  const database = getDB()
  const id = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const stmt = database.prepare(`
    INSERT INTO guests (id, name, email, code, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  stmt.run(id, data.name, data.email, data.code, now, now)

  return {
    id,
    name: data.name,
    email: data.email,
    code: data.code,
    rsvp: {
      status: 'pending',
    },
    createdAt: now,
  }
}

export function getGuestByCode(code: string): Guest | null {
  const database = getDB()
  const stmt = database.prepare('SELECT * FROM guests WHERE code = ?')
  const row = stmt.get(code) as any

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    code: row.code,
    rsvp: {
      status: row.rsvp_status,
      guests: row.rsvp_guests,
      accommodation: row.rsvp_accommodation,
      dietary: row.rsvp_dietary,
      message: row.rsvp_message,
      submittedAt: row.rsvp_submitted_at,
    },
    createdAt: row.created_at,
  }
}

export function getGuestByEmail(email: string): Guest | null {
  const database = getDB()
  const stmt = database.prepare('SELECT * FROM guests WHERE email = ?')
  const row = stmt.get(email) as any

  if (!row) return null

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    code: row.code,
    rsvp: {
      status: row.rsvp_status,
      guests: row.rsvp_guests,
      accommodation: row.rsvp_accommodation,
      dietary: row.rsvp_dietary,
      message: row.rsvp_message,
      submittedAt: row.rsvp_submitted_at,
    },
    createdAt: row.created_at,
  }
}

export function getAllGuests(): Guest[] {
  const database = getDB()
  const stmt = database.prepare('SELECT * FROM guests ORDER BY created_at DESC')
  const rows = stmt.all() as any[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    code: row.code,
    rsvp: {
      status: row.rsvp_status,
      guests: row.rsvp_guests,
      accommodation: row.rsvp_accommodation,
      dietary: row.rsvp_dietary,
      message: row.rsvp_message,
      submittedAt: row.rsvp_submitted_at,
    },
    createdAt: row.created_at,
  }))
}

export function updateGuestRSVP(
  code: string,
  rsvp: {
    status: 'attending' | 'declined'
    guests?: number
    accommodation?: string
    dietary?: string
    message?: string
  }
): Guest | null {
  const database = getDB()
  const now = new Date().toISOString()

  const stmt = database.prepare(`
    UPDATE guests 
    SET rsvp_status = ?, rsvp_guests = ?, rsvp_accommodation = ?, 
        rsvp_dietary = ?, rsvp_message = ?, rsvp_submitted_at = ?, updated_at = ?
    WHERE code = ?
  `)

  stmt.run(
    rsvp.status,
    rsvp.guests || null,
    rsvp.accommodation || null,
    rsvp.dietary || null,
    rsvp.message || null,
    now,
    now,
    code
  )

  return getGuestByCode(code)
}

export function deleteGuest(code: string): boolean {
  const database = getDB()
  const stmt = database.prepare('DELETE FROM guests WHERE code = ?')
  const result = stmt.run(code)
  return (result.changes || 0) > 0
}

// ===== ADMIN OPERATIONS =====

export async function createAdmin(data: { email: string; password: string; name?: string }) {
  const bcrypt = require('bcryptjs')
  const database = getDB()
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const now = new Date().toISOString()

  const stmt = database.prepare(
    'INSERT INTO admins (email, password, name, created_at) VALUES (?, ?, ?, ?)'
  )

  stmt.run(data.email, hashedPassword, data.name || null, now)

  return {
    email: data.email,
    name: data.name,
    createdAt: now,
  }
}

export function getAdminByEmail(email: string): Admin | null {
  const database = getDB()
  const stmt = database.prepare('SELECT * FROM admins WHERE email = ?')
  const row = stmt.get(email) as any

  if (!row) return null

  return {
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
  }
}

export async function validateAdminPassword(
  email: string,
  password: string
): Promise<boolean> {
  const bcrypt = require('bcryptjs')
  const admin = getAdminByEmail(email)

  if (!admin) return false

  return await bcrypt.compare(password, admin.password)
}

export function getAllAdmins() {
  const database = getDB()
  const stmt = database.prepare('SELECT email, name, created_at FROM admins ORDER BY created_at')
  return stmt.all()
}

// ===== UTILS =====

export function closeDB() {
  if (db) {
    db.close()
    db = null
  }
}
