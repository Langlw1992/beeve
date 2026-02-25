/**
 * @beeve/server - 环境变量验证
 *
 * 使用 Zod 验证和解析环境变量，确保应用启动时所有必要配置都已提供。
 */

import {z} from 'zod'

// ==================== 环境变量 Schema 定义 ====================

const envSchema = z.object({
  /** 数据库连接 URL */
  DATABASE_URL: z.string().min(1, '必须提供 DATABASE_URL'),

  /** 服务端口号 */
  PORT: z.coerce.number().int().positive().default(3000),

  /** Better Auth 密钥（Wave 2 使用） */
  BETTER_AUTH_SECRET: z.string().min(1, '必须提供 BETTER_AUTH_SECRET'),

  /** Better Auth 服务 URL（Wave 2 使用） */
  BETTER_AUTH_URL: z.url().default('http://localhost:3000'),

  /** CORS 允许的源 */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

// ==================== 环境变量解析与导出 ====================

type Env = z.infer<typeof envSchema>

const parseEnv = (): Env => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('❌ 环境变量验证失败：')
    console.error(z.prettifyError(result.error))
    process.exit(1)
  }

  return result.data
}

export const env = parseEnv()
