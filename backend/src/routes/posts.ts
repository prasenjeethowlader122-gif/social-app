import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { db } from '../db'
import { posts, likes, comments, users } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { authMiddleware } from '../middleware/auth'

const router = Router()

const createPostSchema = z.object({
  content: z.string().min(1).max(280),
})

// Get feed (posts from followed users)
router.get('/feed', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100)
    const offset = parseInt(req.query.offset as string) || 0

    // Get posts from users being followed
    const userPosts = await db.query.posts.findMany({
      where: (post) => {
        // This is a simplified version - in production you'd want a proper JOIN
        return eq(post.authorId, userId)
      },
      orderBy: (post) => [desc(post.createdAt)],
      limit,
      offset,
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
      posts: userPosts.map((post) => ({
        ...post,
        likeCount: post.likes.length,
        commentCount: post.comments.length,
        isLikedByMe: false, // TODO: Check if current user liked
      })),
      limit,
      offset,
    })
  } catch (error) {
    console.error('[Posts Feed Error]', error)
    res.status(500).json({ error: 'Failed to fetch feed' })
  }
})

// Create post
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const body = createPostSchema.parse(req.body)

    const newPost = await db
      .insert(posts)
      .values({
        authorId: userId,
        content: body.content,
      })
      .returning()

    const post = newPost[0]

    // Fetch author details
    const author = await db.query.users.findFirst({
      where: eq(users.id, post.authorId),
    })

    const { passwordHash, ...safeAuthor } = author!

    res.status(201).json({
      ...post,
      author: safeAuthor,
      likeCount: 0,
      commentCount: 0,
      isLikedByMe: false,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message })
    }
    console.error('[Posts Create Error]', error)
    res.status(500).json({ error: 'Failed to create post' })
  }
})

// Delete post
router.delete('/:postId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { postId } = req.params

    // Check if user owns the post
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, postId),
    })

    if (!post) {
      return res.status(404).json({ error: 'Post not found' })
    }

    if (post.authorId !== userId) {
      return res.status(403).json({ error: 'Not authorized' })
    }

    await db.delete(posts).where(eq(posts.id, postId))

    res.json({ success: true })
  } catch (error) {
    console.error('[Posts Delete Error]', error)
    res.status(500).json({ error: 'Failed to delete post' })
  }
})

// Like post
router.post('/:postId/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { postId } = req.params

    // Check if already liked
    const existing = await db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, postId)),
    })

    if (existing) {
      return res.status(409).json({ error: 'Already liked' })
    }

    await db.insert(likes).values({
      userId,
      postId,
    })

    res.status(201).json({ success: true })
  } catch (error) {
    console.error('[Posts Like Error]', error)
    res.status(500).json({ error: 'Failed to like post' })
  }
})

// Unlike post
router.delete('/:postId/like', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId
    const { postId } = req.params

    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.postId, postId)))

    res.json({ success: true })
  } catch (error) {
    console.error('[Posts Unlike Error]', error)
    res.status(500).json({ error: 'Failed to unlike post' })
  }
})

// Comment on post
router.post(
  '/:postId/comments',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId
      const { postId } = req.params
      const { content } = req.body

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ error: 'Comment cannot be empty' })
      }

      const newComment = await db
        .insert(comments)
        .values({
          postId,
          authorId: userId,
          content,
        })
        .returning()

      const comment = newComment[0]

      // Fetch author details
      const author = await db.query.users.findFirst({
        where: eq(users.id, comment.authorId),
      })

      const { passwordHash, ...safeAuthor } = author!

      res.status(201).json({
        ...comment,
        author: safeAuthor,
      })
    } catch (error) {
      console.error('[Posts Comment Error]', error)
      res.status(500).json({ error: 'Failed to add comment' })
    }
  },
)

export default router
