import { getRedis } from '../lib/db-upstash'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'florian.kuehn96@gmx.de'
const NEW_PASSWORD = 'changeme456'
const KEYS = {
  ADMIN: (email: string) => `admin:${email}`,
  ADMIN_LIST: () => `admins:list`,
}

async function resetAdminPassword() {
  console.log(`[Reset] Checking admin: ${ADMIN_EMAIL}`)
  
  const redis = getRedis()
  const key = KEYS.ADMIN(ADMIN_EMAIL.toLowerCase())
  
  // Check if admin exists
  const existingData = await redis.get(key)
  
  let admin
  if (existingData) {
    console.log('[Reset] Admin exists, updating password...')
    admin = typeof existingData === 'string' ? JSON.parse(existingData) : existingData
  } else {
    console.log('[Reset] Admin does not exist, creating new admin...')
    admin = {
      email: ADMIN_EMAIL.toLowerCase(),
      createdAt: new Date().toISOString(),
    }
    // Add to admin list
    await redis.sadd(KEYS.ADMIN_LIST(), admin.email)
  }
  
  // Hash new password
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10)
  admin.password = hashedPassword
  admin.updatedAt = new Date().toISOString()
  
  // Save to Redis
  await redis.set(key, JSON.stringify(admin))
  
  console.log('[Reset] Password successfully updated!')
  console.log(`[Reset] Admin: ${admin.email}`)
  console.log(`[Reset] Key: ${key}`)
}

resetAdminPassword().catch(err => {
  console.error('[Reset] Error:', err)
  process.exit(1)
})
