/**
 * @beeve/db - 数据库客户端
 *
 * 使用 postgres.js 驱动 + Drizzle ORM 创建数据库连接。
 * 需要设置 DATABASE_URL 环境变量。
 *
 * 使用延迟初始化模式，只有在首次访问 db 时才创建连接，
 * 避免仅导入 schema 时触发数据库连接。
 */

import {drizzle} from 'drizzle-orm/postgres-js'
import type {PostgresJsDatabase} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

// 缓存的数据库实例
let _db: PostgresJsDatabase<typeof schema> | undefined

/**
 * 获取数据库实例（延迟初始化）
 *
 * 首次调用时创建 postgres.js 连接和 Drizzle ORM 实例，
 * 后续调用返回缓存的实例。
 */
export function getDb(): PostgresJsDatabase<typeof schema> {
  if (!_db) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL 环境变量未设置')
    }

    const queryClient = postgres(connectionString)
    _db = drizzle({client: queryClient, schema})
  }
  return _db
}
