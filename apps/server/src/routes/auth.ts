/**
 * @beeve/server - 认证路由
 *
 * 将 Better Auth handler 挂载到 Elysia，
 * 所有 /api/auth/* 请求由 Better Auth 处理。
 */

import {Elysia} from 'elysia'
import {auth} from '../auth'

// ==================== 认证路由插件 ====================

export const authRoutes = new Elysia({name: 'auth'}).mount(auth.handler)
