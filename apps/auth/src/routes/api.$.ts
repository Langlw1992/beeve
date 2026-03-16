import { createFileRoute } from '@tanstack/solid-router'
import { app } from '@/lib/server'

// Elysia handler 适配 TanStack Start - Elysia 官方推荐模式
// @see https://elysiajs.com/integrations/tanstack-start.html
const handle = ({ request }: { request: Request }) => app.fetch(request)

// 捕获所有 /api/* 请求，交给 Elysia 处理
export const Route = createFileRoute('/api/$')({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
})
