/**
 * @beeve/db - 数据库客户端
 *
 * 使用 postgres.js 驱动 + Drizzle ORM 创建数据库连接。
 * 需要设置 DATABASE_URL 环境变量。
 */

import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

// 创建 postgres.js 连接
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL 环境变量未设置')
}

const queryClient = postgres(connectionString)

// 创建 Drizzle ORM 实例，绑定 schema 以支持关系查询
export const db = drizzle({client: queryClient, schema})
