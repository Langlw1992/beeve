import {randomUUID} from 'node:crypto'

/**
 * 生成唯一 ID
 * 使用 Node.js crypto.randomUUID
 */
export function generateId(): string {
  return randomUUID()
}

/**
 * 生成带前缀的 ID
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '')}`
}
