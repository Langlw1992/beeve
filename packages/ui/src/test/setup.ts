/**
 * Vitest 测试环境配置
 * 在每个测试文件执行前运行
 */

import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// 清理 DOM
afterEach(() => {
  document.body.innerHTML = ''
})

