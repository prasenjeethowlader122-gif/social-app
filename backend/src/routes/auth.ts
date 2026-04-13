import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import {
  hashPassword,
  comparePassword,
  generateToken,
  isValidEmail,
  isValidHandle,
  isValidPassword,
} from '../utils/auth'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  handle: z.string().min(3).max(30),
  displayName: z.string().min(1).max(100),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body)

    // Validate email format
    if (!isValidEmail(body.email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate handle format
    if (!isValidHandle(body.handle)) {
      return res.status(400).json({
        error: 'Handle must be 3-30 characters, alphanumeric and underscore only',
      })
    }

    // Validate password strength
    if (!isValidPassword(body.password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      })
    }

    // Check if email exists
    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, body.email.toLowerCase()),
    })

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    // Check if handle exists
    const existingHandle = await db.query.users.findFirst({
      where: eq(users.handle, body.handle.toLowerCase()),
    })

    if (existingHandle) {
      return res.status(409).json({ error: 'Handle already taken' })
    }

    // Hash password
    const passwordHash = await hashPassword(body.password)

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email: body.email.toLowerCase(),
        handle: body.handle.toLowerCase(),
        displayName: body.displayName,
        passwordHash,
      })
      .returning()

    const user = newUser[0]

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      handle: user.handle,
    })

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('[Auth Register Error]', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body)

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, body.email.toLowerCase()),
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Compare password
    const isValid = await comparePassword(body.password, user.passwordHash)

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      handle: user.handle,
    })

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        handle: user.handle,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('[Auth Login Error]', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

export default router
