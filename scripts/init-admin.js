#!/usr/bin/env node

/**
 * Initialize admin accounts (Upstash Redis)
 * Usage: node scripts/init-admin.js
 */

const bcrypt = require('bcryptjs')
const { Redis } = require('@upstash/redis')

// Check for env vars
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

if (!REDIS_URL || !REDIS_TOKEN) {
  console.error('❌ UPSTASH_REDIS_REST_URL und UPSTASH_REDIS_REST_TOKEN erforderlich!')
  console.error('   Setze die Umgebungsvariablen in Vercel oder lokal')
  process.exit(1)
}

const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
})

const KEYS = {
  ADMIN: (email) => `admin:${email.toLowerCase()}`,
  ADMIN_LIST: () => `admins:list`,
}

async function createAdmin(email, password, name) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const now = new Date().toISOString()

    const admin = {
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: now,
      name,
    }

    await redis.set(KEYS.ADMIN(email), JSON.stringify(admin))
    await redis.sadd(KEYS.ADMIN_LIST(), email.toLowerCase())

    console.log(`✅ Admin erstellt: ${email}`)
  } catch (error) {
    console.error(`❌ Fehler bei ${email}: ${error.message}`)
  }
}

async function main() {
  console.log('🔐 Initialisiere Admin-Accounts (Upstash)...\n')

  // Admin accounts
  await createAdmin('schmittnatascha92@yahoo.de', 'changeme123', 'Natascha')
  await createAdmin('florian.kuehn96@gmx.de', 'changeme456', 'Florian')

  console.log('\n✅ Admin-Setup abgeschlossen!')
  console.log('\n⚠️  WICHTIG: Passwörter nach dem ersten Login ändern!')

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
