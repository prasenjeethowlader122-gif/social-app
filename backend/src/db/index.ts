import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })

// Test database connection
pool.on('error', (err) => {
  console.error('[Database Error]', err)
})

export async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('[Database] Connection successful:', result.rows[0])
    return true
  } catch (error) {
    console.error('[Database] Connection failed:', error)
    return false
  }
}

export async function closeConnection() {
  await pool.end()
}
