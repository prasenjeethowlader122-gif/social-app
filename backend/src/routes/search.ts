import { Router, Request, Response } from 'express'
import { db } from '../db'
import { users, posts } from '../db/schema'
import { ilike, desc, or } from 'drizzle-orm'

const router = Router()

// Search users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' })
    }

    const searchQuery = `%${q}%`

    const results = await db.query.users.findMany({
      where: or(
        ilike(users.handle, searchQuery),
        ilike(users.displayName, searchQuery),
      ),
      limit: Math.min(parseInt(limit as string) || 20, 100),
      offset: parseInt(offset as string) || 0,
    })

    res.json({
      results: results.map((user) => {
        const { passwordHash, ...safeUser } = user
        return safeUser
      }),
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Search Users Error]', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Search posts
router.get('/posts', async (req: Request, res: Response) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query

    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' })
    }

    const searchQuery = `%${q}%`

    const results = await db.query.posts.findMany({
      where: ilike(posts.content, searchQuery),
      orderBy: (post) => [desc(post.createdAt)],
      limit: Math.min(parseInt(limit as string) || 20, 100),
      offset: parseInt(offset as string) || 0,
      with: {
        author: true,
        likes: true,
        comments: {
          with: {
            author: true,
          },
        },
      },
    })

    res.json({
      results: results.map((post) => ({
        ...post,
        author: {
          ...post.author,
          passwordHash: undefined,
        },
        likeCount: post.likes.length,
        commentCount: post.comments.length,
      })),
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Search Posts Error]', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

// Trending (most liked posts)
router.get('/trending', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query

    // Note: This is a simplified version. In production, you'd want to query
    // based on likes count aggregation
    const trendingPosts = await db.query.posts.findMany({
      orderBy: (post) => [desc(post.createdAt)],
      limit: Math.min(parseInt(limit as string) || 20, 100),
      offset: parseInt(offset as string) || 0,
      with: {
        author: true,
        likes: true,
        comments: {
          with: {
            author: true,
          },
        },
      },
    })

    res.json({
      results: trendingPosts.map((post) => ({
        ...post,
        author: {
          ...post.author,
          passwordHash: undefined,
        },
        likeCount: post.likes.length,
        commentCount: post.comments.length,
      })),
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Trending Error]', error)
    res.status(500).json({ error: 'Failed to fetch trending' })
  }
})

export default router
