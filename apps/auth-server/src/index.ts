import {cors} from '@elysiajs/cors'
import {Elysia} from 'elysia'

import {auth} from './auth'

const app = new Elysia()
  .use(cors({
    origin: process.env.AUTH_WEB_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }))
  .mount(auth.handler)
  .get('/health', () => ({status: 'ok'}))
  .listen(process.env.PORT ?? 8000)

console.log(`🚀 Auth server running at ${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
