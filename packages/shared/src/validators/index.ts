/**
 * @beeve/shared - Validators
 * 共享 Zod 验证 Schema
 */

import { z } from 'zod'

// 基础验证器
export const emailSchema = z.string().email('无效的邮箱地址')
export const passwordSchema = z.string().min(8, '密码至少 8 位').max(100, '密码不能超过 100 位')
export const uuidSchema = z.string().uuid('无效的 UUID')

// 分页参数
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationInput = z.infer<typeof paginationSchema>

// 用户相关
export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, '名称不能为空').max(100, '名称不能超过 100 个字符'),
  password: passwordSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatar: z.string().url('无效的头像 URL').optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>

// 登录
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '密码不能为空'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ID 参数
export const idParamSchema = z.object({
  id: uuidSchema,
})

export type IdParam = z.infer<typeof idParamSchema>
