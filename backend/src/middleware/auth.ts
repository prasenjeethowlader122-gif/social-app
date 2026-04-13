import { Request, Response, NextFunction } from 'express'
import { verifyToken, extractTokenFromHeader } from '../utils/auth'

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization)

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' })
  }

  const payload = verifyToken(token)

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  ;(req as any).userId = payload.userId
  ;(req as any).userEmail = payload.email
  ;(req as any).userHandle = payload.handle

  next()
}

// Optional auth middleware - doesn't fail if no token provided
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = extractTokenFromHeader(req.headers.authorization)

  if (token) {
    const payload = verifyToken(token)
    if (payload) {
      ;(req as any).userId = payload.userId
      ;(req as any).userEmail = payload.email
      ;(req as any).userHandle = payload.handle
    }
  }

  next()
}
