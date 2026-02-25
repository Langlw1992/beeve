/**
 * @beeve/db - OIDC Provider Schema
 *
 * 定义 Better Auth OIDC Provider 插件所需的数据库表：
 * - oauthApplication：OAuth 客户端应用注册
 * - oauthAccessToken：OAuth 访问令牌与刷新令牌
 * - oauthConsent：用户对 OAuth 客户端的授权同意记录
 *
 * 注意：使用 `bun x @better-auth/cli generate` 可以重新生成此文件。
 */

import {boolean, pgTable, text, timestamp} from 'drizzle-orm/pg-core'
import {user} from './auth'

// ==================== OAuth 应用表 ====================
export const oauthApplication = pgTable('oauth_application', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon'),
  metadata: text('metadata'),
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret'),
  redirectUrls: text('redirect_urls').notNull(),
  type: text('type').notNull(),
  disabled: boolean('disabled').default(false),
  userId: text('user_id').references(() => user.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== OAuth 访问令牌表 ====================
export const oauthAccessToken = pgTable('oauth_access_token', {
  id: text('id').primaryKey(),
  accessToken: text('access_token').notNull().unique(),
  refreshToken: text('refresh_token').notNull().unique(),
  accessTokenExpiresAt: timestamp('access_token_expires_at').notNull(),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at').notNull(),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthApplication.clientId, {onDelete: 'cascade'}),
  userId: text('user_id').references(() => user.id, {onDelete: 'cascade'}),
  scopes: text('scopes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ==================== OAuth 授权同意表 ====================
export const oauthConsent = pgTable('oauth_consent', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthApplication.clientId, {onDelete: 'cascade'}),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  scopes: text('scopes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  consentGiven: boolean('consent_given').notNull(),
})
