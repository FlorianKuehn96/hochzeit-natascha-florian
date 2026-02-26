#!/usr/bin/env node

/**
 * Initialize admin accounts
 * Usage: node scripts/init-admin.js
 */

const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'hochzeit.db')
const db = new Database(dbPath)

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    email TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    name TEXT,
    created_at TEXT NOT NULL
  )
`)

async function createAdmin(email, password, name) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()

    const stmt = db.prepare(
      'INSERT INTO admins (email, password, name, created_at) VALUES (?, ?, ?, ?)'
    )

    stmt.run(email, hashedPassword, name, now)
    console.log(`✅ Admin erstellt: ${email}`)
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      console.log(`⚠️  Admin existiert bereits: ${email}`)
    } else {
      console.error(`❌ Fehler: ${error.message}`)
    }
  }
}

async function main() {
  console.log('🔐 Initialisiere Admin-Accounts...\n')

  // Prompt for admin accounts (for now, hardcoded - change these!)
  await createAdmin('natascha@hochzeit.de', 'changeme123', 'Natascha')
  await createAdmin('florian@hochzeit.de', 'changeme456', 'Florian')

  console.log('\n✅ Admin-Setup abgeschlossen!')
  console.log('\n⚠️  WICHTIG: Passwörter nach dem ersten Login ändern!')

  db.close()
}

main().catch(console.error)
