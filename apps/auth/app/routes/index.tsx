import {createFileRoute, redirect} from '@tanstack/solid-router'

export const Route = createFileRoute('/')({
  beforeLoad: async ({context}) => {
    // 未登录用户重定向到登录页
    if (!context.user) {
      throw redirect({to: '/login'})
    }
    // 已登录用户重定向到仪表盘
    throw redirect({to: '/dashboard'})
  },
})
