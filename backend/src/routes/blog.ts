import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { authMiddleware } from '../middleware/auth'
import { createBlogSchema,updateBlogSchema } from '@gammarays/medium-blog-common'

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string,
  }
  Variables: {
    userId: string,
  }
}>()

blogRouter.use('/*', authMiddleware)

// PROTECTED ROUTES - REQUIRES AUTHENTICATION

// CREATE BLOG POST
blogRouter.post('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const body = await c.req.json()
  const userId = c.get('userId')

  const result = createBlogSchema.safeParse(body)

  if (!result.success) {
    return c.json({
      error: {
        message: 'Invalid blog data',
        details: result.error.issues
      }
    }, 400)
  }

  const { title, content } = result.data

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: userId
      }
    })

    return c.json({
      message: 'Post created successfully',
      id: post.id
    }, 201)

  } catch (error) {
    return c.json({
      error: {
        message: 'Error creating post',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, 500)
  }
})

// UPDATE BLOG POST
blogRouter.put('/', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const body = await c.req.json()
  const userId = c.get('userId')

  const result = updateBlogSchema.safeParse(body)

  if (!result.success) {
    return c.json({
      error: {
        message: 'Invalid blog data',
        details: result.error.issues
      }
    }, 400)
  }

  const { id, title, content } = result.data

  try {
    const post = await prisma.post.updateMany({
      where: {
        id,
        authorId: userId
      },
      data: {
        title,
        content,
      }
    })

    if (post.count === 0) {
      return c.json({
        message: 'Blog post not found or you are not the author',
      }, 404)
    }

    return c.json({
      message: 'Post updated successfully'
    }, 200)

  } catch (error) {
    return c.json({
      error: {
        message: 'Error updating post',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, 500)
  }
})

// GET ALL BLOGS
blogRouter.get('/bulk', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const page = Number(c.req.query('page')) || 1
  const limit = 10

  if (page < 1) {
    return c.json({
      error: {
        message: 'Page must be greater than 0',
        code: 'INVALID_PAGE'
      }
    }, 400)
  }

  const skip = (page - 1) * limit

  try {
    const posts = await prisma.post.findMany({
      skip,
      take: limit
    })

    return c.json({
      posts,
      page,
      limit
    }, 200)

  } catch (error) {
    return c.json({
      error: {
        message: 'Error fetching blogs',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, 500)
  }
})

// GET BLOG BY ID
blogRouter.get('/:id', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate())

  const id = c.req.param('id')

  try {
    const post = await prisma.post.findUnique({
      where: {
        id
      }
    })

    if (!post) {
      return c.json({
        error: {
          message: 'Blog not found'
        }
      }, 404)
    }

    return c.json({
      post
    }, 200)

  } catch (error) {
    return c.json({
      error: {
        message: 'Error fetching blog',
        code: 'INTERNAL_SERVER_ERROR'
      }
    }, 500)
  }
})