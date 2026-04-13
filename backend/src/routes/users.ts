import { Router, Request, Response } from 'express'
import { db } from '../db'
import { users, follows, posts, likes } from '../db/schema'
import { eq, and, or } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'

const router = Router()

// Get user profile by handle
router.get('/:handle', async (req: Request, res: Response) => {
  try {
    const { handle } = req.params

    const user = await db.query.users.findFirst({
      where: eq(users.handle, handle.toLowerCase()),
      with: {
        posts: {
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
          limit: 10,
          with: {
            author: true,
            likes: true,
            comments: true,
          },
        },
        followers: true,
        following: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const { passwordHash, ...safeUser } = user

    res.json({
      ...safeUser,
      followerCount: user.followers.length,
      followingCount: user.following.length,
      postsCount: user.posts.length,
    })
  } catch (error) {
    console.error('[Users Get Profile Error]', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// Update user profile
router.patch('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { displayName, bio, avatarUrl, bannerUrl, isPrivate } = req.body

    const updatedUser = await db
      .update(users)
      .set({
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(bannerUrl !== undefined && { bannerUrl }),
        ...(isPrivate !== undefined && { isPrivate }),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    const user = updatedUser[0]
    const { passwordHash, ...safeUser } = user

    res.json(safeUser)
  } catch (error) {
    console.error('[Users Update Profile Error]', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Follow user
router.post('/:userId/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId
    const { userId: targetUserId } = req.params

    if (followerId === targetUserId) {
      return res.status(400).json({ error: 'Cannot follow yourself' })
    }

    // Check if already following
    const existing = await db.query.follows.findFirst({
      where: and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, targetUserId),
      ),
    })

    if (existing) {
      return res.status(409).json({ error: 'Already following this user' })
    }

    await db.insert(follows).values({
      followerId,
      followingId: targetUserId,
    })

    res.status(201).json({ success: true })
  } catch (error) {
    console.error('[Users Follow Error]', error)
    res.status(500).json({ error: 'Failed to follow user' })
  }
})

// Unfollow user
router.delete('/:userId/follow', authMiddleware, async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).userId
    const { userId: targetUserId } = req.params

    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, targetUserId),
        ),
      )

    res.json({ success: true })
  } catch (error) {
    console.error('[Users Unfollow Error]', error)
    res.status(500).json({ error: 'Failed to unfollow user' })
  }
})

export default router
