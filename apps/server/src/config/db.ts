import {drizzle} from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'
import {env} from './env'

// 创建 postgres 连接
const client = postgres(env.DATABASE_URL)

// 导出 drizzle db 实例（传入 schema 供 Better Auth 使用）
export const db = drizzle(client, {schema})
