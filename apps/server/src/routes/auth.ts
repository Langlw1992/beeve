import { Hono } from 'hono'
import { auth } from '../lib/auth'

const app = new Hono()

/**
 * Better-Auth 路由处理
 * 挂载到 /api/auth/*
 */
app.on(['GET', 'POST'], '/*', async (c) => {
  return auth.handler(c.req.raw)
})

export default app
