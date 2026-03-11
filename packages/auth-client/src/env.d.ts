/**
 * 为 import.meta.env 提供类型声明
 * auth-client 作为库需要在 Node.js 和 Vite 环境下都能工作
 * 此声明让 TypeScript 正确识别 import.meta.env，无需 vite/client 全局类型
 */
interface ImportMeta {
  readonly env?: Record<string, string>
}
