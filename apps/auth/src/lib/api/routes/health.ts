import {Elysia} from 'elysia'

export const healthRoutes = new Elysia().get('/health', () => ({
  status: 'ok',
  service: '@beeve/auth',
  timestamp: new Date().toISOString(),
}))
