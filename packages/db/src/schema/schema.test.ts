import { describe, expect, it } from 'vitest'
import { users, type User, type NewUser } from './users'
import { sessions, type Session } from './sessions'
import { accounts, type Account } from './accounts'
import { verifications, type Verification } from './verifications'
import { getTableName, getTableColumns } from 'drizzle-orm'

describe('Schema: users', () => {
  it('should have correct table name', () => {
    expect(getTableName(users)).toBe('users')
  })

  it('should have required columns', () => {
    const columns = Object.keys(getTableColumns(users))
    expect(columns).toContain('id')
    expect(columns).toContain('name')
    expect(columns).toContain('email')
    expect(columns).toContain('emailVerified')
    expect(columns).toContain('image')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })

  it('should export User type', () => {
    const user: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: false,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(user.email).toBe('test@example.com')
  })

  it('should export NewUser type for inserts', () => {
    const newUser: NewUser = {
      name: 'New User',
      email: 'new@example.com',
    }
    expect(newUser.name).toBe('New User')
  })
})

describe('Schema: sessions', () => {
  it('should have correct table name', () => {
    expect(getTableName(sessions)).toBe('sessions')
  })

  it('should have required columns', () => {
    const columns = Object.keys(getTableColumns(sessions))
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('token')
    expect(columns).toContain('expiresAt')
    expect(columns).toContain('ipAddress')
    expect(columns).toContain('userAgent')
  })

  it('should export Session type', () => {
    const session: Session = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      token: 'test-token',
      expiresAt: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Test Agent',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(session.token).toBe('test-token')
  })
})

describe('Schema: accounts', () => {
  it('should have correct table name', () => {
    expect(getTableName(accounts)).toBe('accounts')
  })

  it('should have required columns', () => {
    const columns = Object.keys(getTableColumns(accounts))
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('accountId')
    expect(columns).toContain('providerId')
    expect(columns).toContain('accessToken')
    expect(columns).toContain('refreshToken')
  })

  it('should export Account type', () => {
    const account: Account = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      userId: '123e4567-e89b-12d3-a456-426614174001',
      accountId: 'github-123',
      providerId: 'github',
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      scope: 'user:email',
      idToken: null,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(account.providerId).toBe('github')
  })
})

describe('Schema: verifications', () => {
  it('should have correct table name', () => {
    expect(getTableName(verifications)).toBe('verifications')
  })

  it('should have required columns', () => {
    const columns = Object.keys(getTableColumns(verifications))
    expect(columns).toContain('id')
    expect(columns).toContain('identifier')
    expect(columns).toContain('value')
    expect(columns).toContain('expiresAt')
  })

  it('should export Verification type', () => {
    const verification: Verification = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      identifier: 'test@example.com',
      value: 'verification-code',
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    expect(verification.identifier).toBe('test@example.com')
  })
})
