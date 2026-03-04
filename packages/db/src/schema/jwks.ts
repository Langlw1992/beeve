/**
 * @beeve/db - JWKS Schema
 *
 * 定义 Better Auth JWT 插件所需的 JWKS 数据库表。
 * 存储 JSON Web Key Set 的公钥和私钥对。
 *
 * 注意：使用 `bun x @better-auth/cli generate` 可以重新生成此文件。
 */

import {pgTable, text, timestamp} from 'drizzle-orm/pg-core'

// ==================== JWKS 表 ====================
export const jwks = pgTable('jwks', {
  id: text('id').primaryKey(),
  publicKey: text('public_key').notNull(),
  privateKey: text('private_key').notNull(),
  createdAt: timestamp('created_at').notNull(),
  expiresAt: timestamp('expires_at'),
})
