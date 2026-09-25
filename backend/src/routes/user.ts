import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign} from 'hono/jwt'
import {hashPassword, verifyPassword} from '../utils/hash'


//SIGNUP ROUTE - PUBLIC
export const userRouter = new Hono<{ Bindings:{
  DATABASE_URL: string,
  JWT_SECRET: string,
}
}>();

userRouter.post('/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());
  const body = await c.req.json()

  if (!body.email || !body.password) {
    return c.json({ message: 'Email and password are required' }, 400)
  }

  try{
    const hashedPassword = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword
      }
    })
    const jwt = await sign ({ id: user.id}, c.env.JWT_SECRET, 'HS256')
    return c.json({ jwt }, 201)
  } catch (error: any) {
    console.log(error)
    if (error.code === 'P2002') {
      return c.json({ error: {message: 'Email already exists', code: 'USER_ALREADY_EXISTS'}}, 409)
    }
    return c.json({error: {message: 'Something went wrong', code: 'INTERNAL_SERVER_ERROR'}}, 500)
  }
})

//SIGNIN ROUTE - PUBLIC
userRouter.post('/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL
  }).$extends(withAccelerate());
  const body = await c.req.json()
  
  if(!body.email || !body.password) {
    return c.json({error: {message: 'Emaila nd password are required'}}, 400)
  }

  try {
    const user = await prisma.user.findUnique({
      where: {
        email : body.email
      }
    })

    if (!user) {
      return c.json({error: {message: 'Invalid credentials'}}, 403)
    }

    const isvalid = await verifyPassword(body.password, user.password)

    if(!isvalid) {
      return c.json({error: {message: 'Invalid credentials'}}, 403)
    }

    const jwt = await sign({id : user.id}, c.env.JWT_SECRET, 'HS256')
    return c.json({jwt}, 200)
  }catch (error) {
    return c.json({error: {message: 'Something went wrong', code: 'INTERNAL_SERVER_ERROR'}}, 500)
  }
})
