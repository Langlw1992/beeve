/**
 * @beeve/db - OAuth Provider Schema
 *
 * 定义 Better Auth OAuth Provider 插件所需的数据库表：
 * - oauthClient：OAuth 客户端应用注册
 * - oauthRefreshToken：OAuth 刷新令牌
 * - oauthAccessToken：OAuth 访问令牌
 * - oauthConsent：用户对 OAuth 客户端的授权同意记录
 *
 * 注意：使用 `bun x @better-auth/cli generate` 可以重新生成此文件。
 */

import {relations} from 'drizzle-orm'
import {boolean, jsonb, pgTable, text, timestamp} from 'drizzle-orm/pg-core'
import {account, session, user} from './auth'

// ==================== OAuth 客户端表 ====================
export const oauthClient = pgTable('oauth_client', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().unique(),
  clientSecret: text('client_secret'),
  disabled: boolean('disabled').default(false),
  skipConsent: boolean('skip_consent'),
  enableEndSession: boolean('enable_end_session'),
  scopes: text('scopes').array(),
  userId: text('user_id').references(() => user.id, {onDelete: 'cascade'}),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
  name: text('name'),
  uri: text('uri'),
  icon: text('icon'),
  contacts: text('contacts').array(),
  tos: text('tos'),
  policy: text('policy'),
  softwareId: text('software_id'),
  softwareVersion: text('software_version'),
  softwareStatement: text('software_statement'),
  redirectUris: text('redirect_uris').array().notNull(),
  postLogoutRedirectUris: text('post_logout_redirect_uris').array(),
  tokenEndpointAuthMethod: text('token_endpoint_auth_method'),
  grantTypes: text('grant_types').array(),
  responseTypes: text('response_types').array(),
  public: boolean('public'),
  type: text('type'),
  requirePKCE: boolean('require_pkce'),
  referenceId: text('reference_id'),
  metadata: jsonb('metadata'),
})

// ==================== OAuth 刷新令牌表 ====================
export const oauthRefreshToken = pgTable('oauth_refresh_token', {
  id: text('id').primaryKey(),
  token: text('token').notNull(),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClient.clientId, {onDelete: 'cascade'}),
  sessionId: text('session_id').references(() => session.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, {onDelete: 'cascade'}),
  referenceId: text('reference_id'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at'),
  revoked: timestamp('revoked'),
  authTime: timestamp('auth_time'),
  scopes: text('scopes').array().notNull(),
})

// ==================== OAuth 访问令牌表 ====================
export const oauthAccessToken = pgTable('oauth_access_token', {
  id: text('id').primaryKey(),
  token: text('token').unique(),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClient.clientId, {onDelete: 'cascade'}),
  sessionId: text('session_id').references(() => session.id, {
    onDelete: 'set null',
  }),
  userId: text('user_id').references(() => user.id, {onDelete: 'cascade'}),
  referenceId: text('reference_id'),
  refreshId: text('refresh_id').references(() => oauthRefreshToken.id, {
    onDelete: 'cascade',
  }),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at'),
  scopes: text('scopes').array().notNull(),
})

// ==================== OAuth 授权同意表 ====================
export const oauthConsent = pgTable('oauth_consent', {
  id: text('id').primaryKey(),
  clientId: text('client_id')
    .notNull()
    .references(() => oauthClient.clientId, {onDelete: 'cascade'}),
  userId: text('user_id').references(() => user.id, {onDelete: 'cascade'}),
  referenceId: text('reference_id'),
  scopes: text('scopes').array().notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// ==================== Relations ====================

export const userRelations = relations(user, ({many}) => ({
  sessions: many(session),
  accounts: many(account),
  oauthClients: many(oauthClient),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
}))

export const sessionRelations = relations(session, ({one, many}) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
}))

export const accountRelations = relations(account, ({one}) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const oauthClientRelations = relations(oauthClient, ({one, many}) => ({
  user: one(user, {
    fields: [oauthClient.userId],
    references: [user.id],
  }),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
}))

export const oauthRefreshTokenRelations = relations(
  oauthRefreshToken,
  ({one, many}) => ({
    oauthClient: one(oauthClient, {
      fields: [oauthRefreshToken.clientId],
      references: [oauthClient.clientId],
    }),
    session: one(session, {
      fields: [oauthRefreshToken.sessionId],
      references: [session.id],
    }),
    user: one(user, {
      fields: [oauthRefreshToken.userId],
      references: [user.id],
    }),
    oauthAccessTokens: many(oauthAccessToken),
  }),
)

export const oauthAccessTokenRelations = relations(
  oauthAccessToken,
  ({one}) => ({
    oauthClient: one(oauthClient, {
      fields: [oauthAccessToken.clientId],
      references: [oauthClient.clientId],
    }),
    session: one(session, {
      fields: [oauthAccessToken.sessionId],
      references: [session.id],
    }),
    user: one(user, {
      fields: [oauthAccessToken.userId],
      references: [user.id],
    }),
    oauthRefreshToken: one(oauthRefreshToken, {
      fields: [oauthAccessToken.refreshId],
      references: [oauthRefreshToken.id],
    }),
  }),
)

export const oauthConsentRelations = relations(oauthConsent, ({one}) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthConsent.clientId],
    references: [oauthClient.clientId],
  }),
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
}))
