/**
 * 首页 - 重定向到用户中心
 */
import {createFileRoute, redirect} from '@tanstack/solid-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({to: '/profile'})
  },
})
