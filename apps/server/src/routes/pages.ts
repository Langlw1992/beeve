/**
 * @beeve/server - 页面路由
 *
 * 处理服务端渲染页面的 GET 路由。
 * 包括登录页面 (/sign-in) 和注册页面 (/sign-up)。
 */

import {Elysia, t} from 'elysia'
import {SignInPage} from '../pages/sign-in'
import {SignUpPage} from '../pages/sign-up'

// ==================== 查询参数 Schema ====================

const redirectQuery = t.Object({
  redirect: t.Optional(t.String()),
})

// ==================== 页面路由 ====================

export const pageRoutes = new Elysia()
  .get(
    '/sign-in',
    ({query}) => {
      const redirect = query.redirect || '/'
      return SignInPage(redirect)
    },
    {query: redirectQuery},
  )
  .get(
    '/sign-up',
    ({query}) => {
      const redirect = query.redirect || '/'
      return SignUpPage(redirect)
    },
    {query: redirectQuery},
  )
