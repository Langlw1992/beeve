/**
 * Vitest 测试环境配置
 * 在每个测试文件执行前运行
 */

import '@testing-library/jest-dom/vitest'
import {afterEach, vi} from 'vitest'

// Mock ResizeObserver for zag-js
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn()

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = ''
})
