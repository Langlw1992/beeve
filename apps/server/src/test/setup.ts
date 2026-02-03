import {vi} from 'vitest'

// Mock DATABASE_URL 环境变量
process.env.DATABASE_URL = 'postgres://test:test@localhost:5432/test'

// Mock @beeve/db 模块
vi.mock('@beeve/db', () => ({
  db: {
    query: {},
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))
